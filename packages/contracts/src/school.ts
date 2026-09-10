export interface SchoolDto {
  id: string;
  name: string;
  displayName?: string;
  code?: string;
  address?: string;
  organizationId: string;
  isActive: boolean;
}

export interface AcademicYearDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  isCurrent: boolean;
  schoolId: string;
}

export interface ClassDto {
  id: string;
  name: string;
  code?: string;
  sequence: number;
  schoolId: string;
  sections: SectionDto[];
}

export interface SectionDto {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  classId: string;
}
