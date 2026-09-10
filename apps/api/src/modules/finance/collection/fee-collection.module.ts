import { Module } from '@nestjs/common';
import { FeeCollectionController } from './fee-collection.controller';
import { FeeCollectionService } from './fee-collection.service';

@Module({ controllers: [FeeCollectionController], providers: [FeeCollectionService], exports: [FeeCollectionService] })
export class FeeCollectionModule {}
