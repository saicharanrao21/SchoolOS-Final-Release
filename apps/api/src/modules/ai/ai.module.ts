import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai.service';
import { AiAssistantController } from './ai.controller';

@Module({
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
