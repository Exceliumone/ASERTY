import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScanTrendsDto } from './dto/scan-trends.dto';
import { TrendAgentService } from './trend-agent.service';

@ApiTags('agents/trend')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/trend', version: '1' })
export class TrendAgentController {
  constructor(private readonly trendAgentService: TrendAgentService) {}

  @Post('scan')
  scan(@Body() dto: ScanTrendsDto) {
    return this.trendAgentService.scanTrends(dto.signals ?? []);
  }

  @Get('recent')
  recent() {
    return this.trendAgentService.listRecent();
  }
}
