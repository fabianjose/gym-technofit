import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineTemplate } from './entities/routine-template.entity';
import { RoutineDay } from './entities/routine-day.entity';
import { RoutineDayExercise } from './entities/routine-day-exercise.entity';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';
import { CalendarEntryExercise } from '../calendar/entities/calendar-entry-exercise.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(RoutineTemplate)
    private readonly templatesRepository: Repository<RoutineTemplate>,
    @InjectRepository(RoutineDay)
    private readonly daysRepository: Repository<RoutineDay>,
    @InjectRepository(RoutineDayExercise)
    private readonly dayExercisesRepository: Repository<RoutineDayExercise>,
    @InjectRepository(CalendarEntry)
    private readonly calendarEntryRepository: Repository<CalendarEntry>,
    @InjectRepository(CalendarEntryExercise)
    private readonly calendarEntryExerciseRepository: Repository<CalendarEntryExercise>,
    private configService: ConfigService,
  ) {}

  async getActiveTemplate(memberId: number): Promise<RoutineTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { memberId, active: true },
      relations: ['days', 'days.exercises', 'days.exercises.machine'],
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async createTemplate(memberId: number, data: Partial<RoutineTemplate>): Promise<RoutineTemplate> {
    await this.templatesRepository.update({ memberId }, { active: false });

    if (!data.durationMonths) {
      data.durationMonths = this.configService.get<number>('ROUTINE_DURATION_MONTHS') || 2;
    }

    const template = this.templatesRepository.create({ ...data, memberId, active: true });
    const savedTemplate = await this.templatesRepository.save(template);

    await this.generateCalendar(savedTemplate.id);

    return savedTemplate;
  }

  async updateTemplate(templateId: number, data: Partial<RoutineTemplate>): Promise<RoutineTemplate> {
    let template = await this.templatesRepository.findOne({ where: { id: templateId }, relations: ['days'] });
    if (!template) throw new NotFoundException('Template not found');

    if (data.days) {
      await this.daysRepository.delete({ templateId });
    }

    template = await this.templatesRepository.save({ ...template, ...data });
    await this.generateCalendar(template.id);
    return template;
  }

  async generateCalendar(templateId: number) {
    const template = await this.templatesRepository.findOne({
      where: { id: templateId },
      relations: ['days', 'days.exercises'],
    });
    if (!template) return;

    const [year, month, day] = template.startDate.toString().split('T')[0].split('-').map(Number);
    const startDateLocal = new Date(year, month - 1, day, 0, 0, 0);
    
    const endDate = new Date(startDateLocal);
    endDate.setMonth(endDate.getMonth() + template.durationMonths);

    // 1. Obtener fechas con overrides para no sobreescribirlas
    const overrides = await this.calendarEntryRepository.find({
      where: { templateId, isOverride: true }
    });
    const overrideDates = overrides.map(e => String(e.entryDate));

    // 2. Limpiar entradas generadas automáticamente existentes
    await this.calendarEntryRepository.createQueryBuilder()
      .delete()
      .where("template_id = :templateId", { templateId })
      .andWhere("is_override = false")
      .execute();

    const entriesToSave: CalendarEntry[] = [];
    const exerciseDataMap: Map<number, any[]> = new Map();

    let currentDate = new Date(startDateLocal);
    let activeDaysCount = 0;

    // 3. Generar objetos en memoria
    while (currentDate <= endDate) {
      const isSaturday = currentDate.getDay() === 6;
      const isSunday = currentDate.getDay() === 0;

      if ((template.skipSaturday && isSaturday) || (template.skipSunday && isSunday)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dayIndex = (template.skipSaturday || template.skipSunday) ? 
        (activeDaysCount % template.cycleDays) : 
        (Math.round(Math.abs(currentDate.getTime() - startDateLocal.getTime()) / (1000 * 60 * 60 * 24)) % template.cycleDays);

      const tzOffsetLoop = currentDate.getTimezoneOffset() * 60000;
      const dateString = new Date(currentDate.getTime() - tzOffsetLoop).toISOString().split('T')[0];

      if (!overrideDates.includes(dateString)) {
        const baseDay = template.days.find(d => d.dayIndex === dayIndex);
        if (baseDay) {
          const entry = this.calendarEntryRepository.create({
            memberId: template.memberId,
            templateId: template.id,
            entryDate: dateString,
            dayIndex,
            isOverride: false,
            notes: baseDay.notes,
          });
          
          const currentIndexToSave = entriesToSave.length;
          entriesToSave.push(entry);
          
          if (baseDay.exercises && baseDay.exercises.length > 0) {
            exerciseDataMap.set(currentIndexToSave, baseDay.exercises);
          }
        }
      }
      
      activeDaysCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 4. Guardado masivo de entradas
    const savedEntries = await this.calendarEntryRepository.save(entriesToSave);

    // 4. Generar y guardar ejercicios de forma masiva
    const allExercisesToSave: CalendarEntryExercise[] = [];
    
    savedEntries.forEach((entry, index) => {
      const exercisesTemplate = exerciseDataMap.get(index);
      if (exercisesTemplate) {
        exercisesTemplate.forEach(ex => {
          allExercisesToSave.push(this.calendarEntryExerciseRepository.create({
            calendarEntryId: entry.id,
            machineId: ex.machineId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restSeconds: ex.restSeconds,
            orderIndex: ex.orderIndex,
            notes: ex.notes,
          }));
        });
      }
    });

    if (allExercisesToSave.length > 0) {
      // Usar chunks de 100 para no saturar si la rutina es muy larga
      await this.calendarEntryExerciseRepository.save(allExercisesToSave, { chunk: 100 });
    }
  }

  async getCalendar(memberId: number): Promise<CalendarEntry[]> {
    return this.calendarEntryRepository.createQueryBuilder('ce')
      .innerJoinAndSelect('ce.exercises', 'ex')
      .leftJoinAndSelect('ex.machine', 'm')
      .innerJoin('routine_templates', 'rt', 'ce.template_id = rt.id')
      .where('ce.member_id = :memberId', { memberId })
      .andWhere('rt.active = true')
      .orderBy('ce.entry_date', 'ASC')
      .addOrderBy('ex.order_index', 'ASC')
      .getMany();
  }

  async getTodayEntry(memberId: number): Promise<CalendarEntry | null> {
    // Usar la fecha local del sistema ajustada a YYYY-MM-DD
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISODate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    
    return this.calendarEntryRepository.findOne({
      where: { memberId, entryDate: localISODate },
      relations: ['exercises', 'exercises.machine']
    });
  }

  async updateCalendarEntry(entryId: number, data: Partial<CalendarEntry>): Promise<CalendarEntry> {
    const entry = await this.calendarEntryRepository.findOne({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entry not found');
    
    this.calendarEntryRepository.merge(entry, { ...data, isOverride: true });
    return this.calendarEntryRepository.save(entry);
  }
}
