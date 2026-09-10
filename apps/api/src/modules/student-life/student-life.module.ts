import { Module } from '@nestjs/common';
import { StudentLifeService } from './student-life.service';
import { StudentLifeController } from './student-life.controller';
@Module({ controllers: [StudentLifeController], providers: [StudentLifeService], exports: [StudentLifeService] })
export class StudentLifeModule {}
