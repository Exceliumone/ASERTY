import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PabloMemory } from '@pablo/shared';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PabloMemoryService } from './pablo-memory.service';

@ApiTags('pablo-memory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'pablo-memory', version: '1' })
export class PabloMemoryController {
  constructor(private readonly pabloMemoryService: PabloMemoryService) {}

  @Get('active')
  getActive() {
    return this.pabloMemoryService.getActiveMemory();
  }

  @Get('versions')
  listVersions() {
    return this.pabloMemoryService.listVersions();
  }

  @Roles(UserRole.OWNER, UserRole.EDITOR)
  @Post('versions')
  createVersion(@Body() body: { data: PabloMemory; changelog?: string }) {
    return this.pabloMemoryService.createVersion(body.data, body.changelog);
  }

  @Roles(UserRole.OWNER, UserRole.EDITOR)
  @Post('versions/:version/activate')
  activateVersion(@Param('version', ParseIntPipe) version: number) {
    return this.pabloMemoryService.activateVersion(version);
  }
}
