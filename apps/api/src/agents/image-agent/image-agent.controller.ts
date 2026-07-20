import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GenerateImageDto } from './dto/generate-image.dto';
import { ImageAgentService } from './image-agent.service';

@ApiTags('agents/image')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/image', version: '1' })
export class ImageAgentController {
  constructor(private readonly imageAgentService: ImageAgentService) {}

  @Post('generate')
  generate(@Body() dto: GenerateImageDto) {
    return this.imageAgentService.generateImage(dto);
  }

  @Get()
  list() {
    return this.imageAgentService.list();
  }
}
