import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'calendar', version: '1' })
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  schedule(@Body() dto: ScheduleTweetDto) {
    return this.calendarService.schedule(dto);
  }

  @Patch(':id')
  reschedule(@Param('id') id: string, @Body('scheduledAt') scheduledAt: string) {
    return this.calendarService.reschedule(id, scheduledAt);
  }

  @Delete(':id')
  unschedule(@Param('id') id: string) {
    return this.calendarService.unschedule(id);
  }

  @Get()
  listRange(@Query('from') from: string, @Query('to') to: string) {
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.calendarService.listRange(fromDate, toDate);
  }
}
