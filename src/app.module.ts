import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { TodoModule } from './todo/todo.module';
import { TodosModule } from './todos/todos.module';
import { IaModule } from './ia/ia.module';
import { FoldersModule } from './folders/folders.module';
import { SalaryModule } from './salary/salary.module';
import { BonusModule } from './bonus/bonus.module';
import { DiscountModule } from './discount/discount.module';
import { DebtsModule } from './debts/debts.module';

@Module({
  imports: [
    ScheduleModule,
    AuthModule,
    CalendarModule,
    TodoModule,
    TodosModule,
    IaModule,
    FoldersModule,
    SalaryModule,
    BonusModule,
    DiscountModule,
    DebtsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
