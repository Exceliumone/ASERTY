import { Global, Module } from '@nestjs/common';
import { PabloMemoryController } from './pablo-memory.controller';
import { PabloMemoryService } from './pablo-memory.service';

@Global()
@Module({
  controllers: [PabloMemoryController],
  providers: [PabloMemoryService],
  exports: [PabloMemoryService],
})
export class PabloMemoryModule {}
