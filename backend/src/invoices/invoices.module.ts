import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { MembersModule } from '../members/members.module';
import { PlansModule } from '../plans/plans.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { PdfModule } from '../pdf/pdf.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { GymConfigModule } from '../gym-config/gym-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    MembersModule,
    PlansModule,
    DiscountsModule,
    PdfModule,
    WhatsappModule,
    GymConfigModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
