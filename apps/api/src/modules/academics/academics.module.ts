import { Module } from '@nestjs/common';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { TermsModule } from './terms/terms.module';
import { ClassesModule } from './classes/classes.module';
import { SectionsModule } from './sections/sections.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeacherAssignmentsService } from './teacher-assignments/teacher-assignments.service';
import { TeacherAssignmentsController } from './teacher-assignments/teacher-assignments.controller';
import { CurriculumService } from './curriculum/curriculum.service';
import { CurriculumController } from './curriculum/curriculum.controller';
import { TimetablesService } from './timetables/timetables.service';
import { TimetablesController } from './timetables/timetables.controller';
import { SubstitutionsService } from './substitutions/substitutions.service';
import { SubstitutionsController } from './substitutions/substitutions.controller';
import { AssignmentsService } from './assignments/assignments.service';
import { AssignmentsController } from './assignments/assignments.controller';
import { TimetableOperationsService } from './timetable-operations/timetable-operations.service';
import { TimetableOperationsController } from './timetable-operations/timetable-operations.controller';

@Module({
  imports: [
    AcademicYearsModule,
    TermsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,
  ],
  controllers: [
    TeacherAssignmentsController,
    CurriculumController,
    TimetablesController,
    SubstitutionsController,
    AssignmentsController,
    TimetableOperationsController,
  ],
  providers: [
    TeacherAssignmentsService,
    CurriculumService,
    TimetablesService,
    SubstitutionsService,
    AssignmentsService,
    TimetableOperationsService,
  ],
  exports: [
    AcademicYearsModule,
    TermsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,
    TeacherAssignmentsService,
    CurriculumService,
    TimetablesService,
    SubstitutionsService,
    AssignmentsService,
    TimetableOperationsService,
  ],
})
export class AcademicsModule {}
