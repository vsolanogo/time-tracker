import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { TimeEntry } from './time-entry.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { Project } from '../project/project.entity';

@Injectable()
export class TimeEntryService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    // Validate that the date is not in the future
    const currentDate = new Date().toISOString().split('T')[0];
    if (createTimeEntryDto.date > currentDate) {
      throw new BadRequestException('Date cannot be in the future');
    }

    // Check if there are already entries for this date that exceed 24 hours
    const existingEntries = await this.timeEntryRepository.find({
      where: {
        date: createTimeEntryDto.date,
      },
    });

    const totalHours = existingEntries.reduce((sum, entry) => Number(sum) + Number(entry.hours), 0);
    if (totalHours + Number(createTimeEntryDto.hours) > 24) {
      throw new BadRequestException('Total hours for a date cannot exceed 24 hours');
    }

    // Validate that the project exists
    const project = await this.projectRepository.findOne({
      where: { id: createTimeEntryDto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${createTimeEntryDto.projectId} not found`);
    }

    const timeEntry = this.timeEntryRepository.create(createTimeEntryDto);
    return await this.timeEntryRepository.save(timeEntry);
  }

  async findAll(): Promise<TimeEntry[]> {
    return await this.timeEntryRepository.find({
      relations: ['project'],
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    return await this.timeEntryRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['project'],
      order: {
        date: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async update(id: string, updateTimeEntryDto: UpdateTimeEntryDto): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id);

    // If date is being updated, validate that it's not in the future
    if (updateTimeEntryDto.date && updateTimeEntryDto.date !== timeEntry.date) {
      const currentDate = new Date().toISOString().split('T')[0];
      if (updateTimeEntryDto.date > currentDate) {
        throw new BadRequestException('Date cannot be in the future');
      }

      // Check if there are other entries for this date that would exceed 24 hours
      const existingEntries = await this.timeEntryRepository.find({
        where: {
          date: updateTimeEntryDto.date,
          id: Not(id), // Exclude current entry from calculation
        },
      });

      let totalHours = existingEntries.reduce((sum, entry) => Number(sum) + Number(entry.hours), 0);
      // Add the updated hours value (or current if not being updated)
      const newHours = updateTimeEntryDto.hours !== undefined ? Number(updateTimeEntryDto.hours) : Number(timeEntry.hours);
      totalHours += newHours;

      if (totalHours > 24) {
        throw new BadRequestException('Total hours for a date cannot exceed 24 hours');
      }
    }

    Object.assign(timeEntry, updateTimeEntryDto);
    return await this.timeEntryRepository.save(timeEntry);
  }

  async remove(id: string): Promise<void> {
    const timeEntry = await this.findOne(id);
    await this.timeEntryRepository.remove(timeEntry);
  }

  async getDailyTotals(startDate: string, endDate: string): Promise<any[]> {
    const entries = await this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .select([
        'timeEntry.date as date',
        'SUM(timeEntry.hours) as totalHours',
        'JSON_AGG(JSON_BUILD_OBJECT(\'id\', timeEntry.id, \'hours\', timeEntry.hours, \'description\', timeEntry.description, \'project\', project.name)) as entries'
      ])
      .leftJoin('timeEntry.project', 'project')
      .where('timeEntry.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('timeEntry.date')
      .orderBy('timeEntry.date', 'DESC')
      .getRawMany();

    return entries;
  }

  async getTotalHours(startDate: string, endDate: string): Promise<number> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .select('SUM(timeEntry.hours)', 'total')
      .where('timeEntry.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return result?.total ? parseInt(result.total, 10) : 0;
  }
}