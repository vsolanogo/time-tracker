import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TimeEntryService } from './time-entry.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

@Controller('time-entries')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TimeEntryController {
  constructor(private readonly timeEntryService: TimeEntryService) {}

  @Post()
  create(@Body() createTimeEntryDto: CreateTimeEntryDto) {
    return this.timeEntryService.create(createTimeEntryDto);
  }

  @Get()
  findAll() {
    return this.timeEntryService.findAll();
  }

  @Get('/range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timeEntryService.findByDateRange(startDate, endDate);
  }

  @Get('/daily-totals')
  getDailyTotals(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timeEntryService.getDailyTotals(startDate, endDate);
  }

  @Get('/total-hours')
  getTotalHours(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timeEntryService.getTotalHours(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeEntryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeEntryDto: UpdateTimeEntryDto) {
    return this.timeEntryService.update(id, updateTimeEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeEntryService.remove(id);
  }
}