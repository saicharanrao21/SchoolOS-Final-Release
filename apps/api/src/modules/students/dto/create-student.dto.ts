import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentStatus } from '@prisma/client';

export class EnrollmentPayloadDto {
  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @IsString()
  @IsNotEmpty()
  campusId: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsOptional()
  rollNumber?: string;
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  houseId?: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @ValidateNested()
  @Type(() => EnrollmentPayloadDto)
  @IsOptional()
  enrollment?: EnrollmentPayloadDto;
}
