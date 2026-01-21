import { IsDateString, IsNumber, IsPositive, IsString, IsNotEmpty, Length, Min, Max } from 'class-validator';

export class CreateTimeEntryDto {
  @IsDateString()
  date: string; // Format: YYYY-MM-DD

  @IsNumber()
  @IsPositive()
  @Max(24) // Maximum 24 hours per entry
  hours: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}