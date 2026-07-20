import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ContentAgentService } from './content-agent.service';
import { GenerateTweetsDto } from './dto/generate-tweets.dto';

@ApiTags('agents/content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/content', version: '1' })
export class ContentAgentController {
  constructor(private readonly contentAgentService: ContentAgentService) {}

  @Post('generate')
  generate(@Body() dto: GenerateTweetsDto) {
    return this.contentAgentService.generateSuggestions(dto.count, dto.context);
  }
}
