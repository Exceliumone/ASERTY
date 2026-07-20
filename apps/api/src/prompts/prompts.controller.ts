import { Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromptRole, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePromptVersionDto } from './dto/create-prompt.dto';
import { PromptsService } from './prompts.service';

@ApiTags('prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'prompts', version: '1' })
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get(':role')
  listByRole(@Param('role', new ParseEnumPipe(PromptRole)) role: PromptRole) {
    return this.promptsService.listByRole(role);
  }

  @Roles(UserRole.OWNER, UserRole.EDITOR)
  @Post()
  createVersion(@Body() dto: CreatePromptVersionDto) {
    return this.promptsService.createVersion(dto);
  }

  @Roles(UserRole.OWNER, UserRole.EDITOR)
  @Post(':role/:version/activate')
  activateVersion(
    @Param('role', new ParseEnumPipe(PromptRole)) role: PromptRole,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.promptsService.activateVersion(role, version);
  }
}
