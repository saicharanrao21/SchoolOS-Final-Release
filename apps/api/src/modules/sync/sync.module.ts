import { Module } from '@nestjs/common';
import { OutboxService } from './outbox/outbox.service';
import { RealtimeService } from './realtime/realtime.service';
import { SyncService } from './sync/sync.service';
import { SyncController } from './sync/sync.controller';

@Module({
  controllers: [SyncController],
  providers: [
    OutboxService,
    RealtimeService,
    SyncService,
  ],
  exports: [
    OutboxService,
    RealtimeService,
    SyncService,
  ],
})
export class SyncModule {}
