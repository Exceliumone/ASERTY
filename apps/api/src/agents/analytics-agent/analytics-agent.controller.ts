import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsAgentService } from './analytics-agent.service';

@ApiTags('agents/analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/analytics', version: '1' })
export class AnalyticsAgentController {
  constructor(private readonly analyticsAgentService: AnalyticsAgentService) {}

  @Post('analyze')
  analyze() {
    return this.analyticsAgentService.analyzePerformance();
  }
}
