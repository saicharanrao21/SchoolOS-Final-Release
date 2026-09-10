import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentFilterDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  schoolId?: string;

  @IsString()
  @IsOptional()
  campusId?: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsString()
  @IsOptional()
  sectionId?: string;

  @IsString()
  @IsOptional()
  academicYearId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
