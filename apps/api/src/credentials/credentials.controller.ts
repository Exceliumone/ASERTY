import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CredentialsService } from './credentials.service';
import { UpsertCredentialDto } from './dto/upsert-credential.dto';

@ApiTags('credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller({ path: 'credentials', version: '1' })
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get()
  list() {
    return this.credentialsService.list();
  }

  @Post()
  upsert(@Body() dto: UpsertCredentialDto) {
    return this.credentialsService.upsert(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.credentialsService.remove(id);
  }
}
