import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CommunityAgentService } from './community-agent.service';
import { SuggestReplyDto } from './dto/suggest-reply.dto';

@ApiTags('agents/community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'agents/community', version: '1' })
export class CommunityAgentController {
  constructor(private readonly communityAgentService: CommunityAgentService) {}

  @Post('suggest-reply')
  suggestReply(@Body() dto: SuggestReplyDto) {
    return this.communityAgentService.suggestReply(dto);
  }

  @Get('pending')
  pending() {
    return this.communityAgentService.listPendingReview();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.communityAgentService.approve(id, user.id);
  }

  @Post(':id/dismiss')
  dismiss(@Param('id') id: string) {
    return this.communityAgentService.dismiss(id);
  }
}
