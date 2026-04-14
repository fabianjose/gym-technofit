import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { MembersModule } from './members/members.module';
import { MachinesModule } from './machines/machines.module';
import { RoutinesModule } from './routines/routines.module';
import { CalendarModule } from './calendar/calendar.module';
import { CategoriesModule } from './categories/categories.module';

import { Admin } from './admins/entities/admin.entity';
import { Member } from './members/entities/member.entity';
import { Machine } from './machines/entities/machine.entity';
import { RoutineTemplate } from './routines/entities/routine-template.entity';
import { RoutineDay } from './routines/entities/routine-day.entity';
import { RoutineDayExercise } from './routines/entities/routine-day-exercise.entity';
import { CalendarEntry } from './calendar/entities/calendar-entry.entity';
import { CalendarEntryExercise } from './calendar/entities/calendar-entry-exercise.entity';
import { WhatsappLog } from './whatsapp/entities/whatsapp-log.entity';
import { Category } from './categories/entities/category.entity';
import { Plan } from './plans/entities/plan.entity';
import { Discount } from './discounts/entities/discount.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { GymConfig } from './gym-config/entities/gym-config.entity';
import { PaymentMethod } from './payment-methods/entities/payment-method.entity';

import { PlansModule } from './plans/plans.module';
import { DiscountsModule } from './discounts/discounts.module';
import { InvoicesModule } from './invoices/invoices.module';
import { GymConfigModule } from './gym-config/gym-config.module';
import { CronModule } from './cron/cron.module';
import { PdfModule } from './pdf/pdf.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

@Module({
  imports: [
    PdfModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Admin, Member, Machine, RoutineTemplate, RoutineDay, RoutineDayExercise,
          CalendarEntry, CalendarEntryExercise, WhatsappLog, Category,
          GymConfig, Plan, Discount, Invoice, PaymentMethod
        ],
        synchronize: true,
        timezone: 'Z',
        charset: 'utf8mb4',
        extra: { dateStrings: true },
      }),
      inject: [ConfigService],
    }),
    WhatsappModule,
    UploadsModule,
    AuthModule,
    AdminsModule,
    MembersModule,
    MachinesModule,
    RoutinesModule,
    CalendarModule,
    CategoriesModule,
    PlansModule,
    DiscountsModule,
    InvoicesModule,
    GymConfigModule,
    CronModule,
    PaymentMethodsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
