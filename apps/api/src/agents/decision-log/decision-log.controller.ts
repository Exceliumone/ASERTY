import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DecisionLogService } from './decision-log.service';

@ApiTags('agents/logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/logs', version: '1' })
export class DecisionLogController {
  constructor(private readonly decisionLogService: DecisionLogService) {}

  @Get()
  listRecent() {
    return this.decisionLogService.listRecent();
  }
}
