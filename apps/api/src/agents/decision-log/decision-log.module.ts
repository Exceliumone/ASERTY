import { Global, Module } from '@nestjs/common';
import { DecisionLogController } from './decision-log.controller';
import { DecisionLogService } from './decision-log.service';

@Global()
@Module({
  controllers: [DecisionLogController],
  providers: [DecisionLogService],
  exports: [DecisionLogService],
})
export class DecisionLogModule {}
