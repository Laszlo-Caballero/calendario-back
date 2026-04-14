import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { TodoModule } from './todo/todo.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [ScheduleModule, AuthModule, CalendarModule, TodoModule, TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
