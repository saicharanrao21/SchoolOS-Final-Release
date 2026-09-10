import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { StudentStatus } from '@prisma/client';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

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
}
