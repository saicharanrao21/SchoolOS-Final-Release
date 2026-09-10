import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateStudentNoteDto {
  @IsString()
  @IsOptional()
  category?: string; // GENERAL, ACADEMIC, DISCIPLINE, COUNSELING, HEALTH, ADMINISTRATIVE

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
