import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [ScheduleModule, AuthModule, CalendarModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
