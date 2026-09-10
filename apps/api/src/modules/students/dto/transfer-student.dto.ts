import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferStudentDto {
  @IsString()
  @IsOptional()
  toSchoolId?: string;

  @IsString()
  @IsNotEmpty()
  toCampusId: string;

  @IsString()
  @IsNotEmpty()
  toAcademicYearId: string;

  @IsString()
  @IsNotEmpty()
  toClassId: string;

  @IsString()
  @IsNotEmpty()
  toSectionId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
