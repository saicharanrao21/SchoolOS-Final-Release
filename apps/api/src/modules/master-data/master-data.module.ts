import { Module } from '@nestjs/common';
import { OrganizationsModule } from './organizations/organizations.module';
import { SchoolsModule } from './schools/schools.module';
import { CampusesModule } from './campuses/campuses.module';
import { DepartmentsModule } from './departments/departments.module';
import { LocationsModule } from './locations/locations.module';
import { HousesModule } from './houses/houses.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    OrganizationsModule,
    SchoolsModule,
    CampusesModule,
    DepartmentsModule,
    LocationsModule,
    HousesModule,
    SettingsModule,
  ],
})
export class MasterDataModule {}
