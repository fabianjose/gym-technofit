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

    const startDate = new Date(template.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + template.durationMonths);

    const overrides = await this.calendarEntryRepository.find({
      where: { templateId, isOverride: true }
    });
    const overrideDates = overrides.map(e => String(e.entryDate));

    await this.calendarEntryRepository.createQueryBuilder()
      .delete()
      .where("template_id = :templateId", { templateId })
      .andWhere("is_override = false")
      .execute();

    let currentDate = new Date(startDate);
    let activeDaysCount = 0;
    while (currentDate <= endDate) {
      const isSaturday = currentDate.getDay() === 6;
      const isSunday = currentDate.getDay() === 0;

      if ((template.skipSaturday && isSaturday) || (template.skipSunday && isSunday)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dayIndex = (template.skipSaturday || template.skipSunday) ? 
        (activeDaysCount % template.cycleDays) : 
        (Math.floor(Math.abs(currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) % template.cycleDays);

      const dateString = currentDate.toISOString().split('T')[0];

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
          const savedEntry = await this.calendarEntryRepository.save(entry);

          if (baseDay.exercises && baseDay.exercises.length > 0) {
            const calExercises = baseDay.exercises.map(ex => this.calendarEntryExerciseRepository.create({
              calendarEntryId: savedEntry.id,
              machineId: ex.machineId,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restSeconds: ex.restSeconds,
              orderIndex: ex.orderIndex,
              notes: ex.notes,
            }));
            await this.calendarEntryExerciseRepository.save(calExercises);
          }
        }
      }
      activeDaysCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  async getCalendar(memberId: number): Promise<CalendarEntry[]> {
    return this.calendarEntryRepository.find({
      where: { memberId },
      relations: ['exercises', 'exercises.machine'],
      order: { entryDate: 'ASC' }
    });
  }

  async getTodayEntry(memberId: number): Promise<CalendarEntry | null> {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return this.calendarEntryRepository.findOne({
      where: { memberId, entryDate: today },
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
