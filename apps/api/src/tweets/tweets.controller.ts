import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TweetStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { TweetsService } from './tweets.service';

@ApiTags('tweets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tweets', version: '1' })
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Get()
  findAll(@Query('status') status?: TweetStatus) {
    return this.tweetsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tweetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTweetDto) {
    return this.tweetsService.update(id, dto);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.tweetsService.archive(id);
  }
}
