import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  kpis() {
    return this.analyticsService.getDashboardKpis();
  }

  @Get('history')
  history(@Query('days') days?: string) {
    return this.analyticsService.getEngagementHistory(days ? parseInt(days, 10) : undefined);
  }

  @Get('insights/:kind')
  insights(@Param('kind') kind: string) {
    return this.analyticsService.getInsightsByKind(kind);
  }
}
