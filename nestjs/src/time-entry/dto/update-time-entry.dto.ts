import { IsDateString, IsNumber, IsPositive, IsString, IsOptional, Length, Min, Max } from 'class-validator';

export class UpdateTimeEntryDto {
  @IsDateString()
  @IsOptional()
  date?: string; // Format: YYYY-MM-DD

  @IsNumber()
  @IsPositive()
  @Max(24) // Maximum 24 hours per entry
  @IsOptional()
  hours?: number;

  @IsString()
  @IsOptional()
  @Length(1, 1000)
  description?: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}