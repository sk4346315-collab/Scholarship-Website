import { Controller, Get, Patch, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard }      from '../auth/jwt.guard'
import { CurrentUser }       from '../../common/decorators/current-user.decorator'
import { UpdateProfileDto }  from './dto/update-profile.dto'
import { TrackApplicationDto } from './dto/track-application.dto'
import { UpdateStatusDto }   from './dto/update-status.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private svc: UsersService) {}

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.svc.updateProfile(req.user.sub, dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all tracked applications' })
  getApplications(@Request() req: any) {
    return this.svc.getApplications(req.user.sub);
  }

  @Post('applications')
  @ApiOperation({ summary: 'Track a scholarship' })
  track(@Request() req: any, @Body() dto: TrackApplicationDto) {
    return this.svc.trackApplication(req.user.sub, dto);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Move application to new status' })
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.updateApplicationStatus(req.user.sub, id, dto.status);
  }

  @Patch('applications/:id/docs')
  @ApiOperation({ summary: 'Update document checklist for an application' })
  updateDocs(@Request() req: any, @Param('id') id: string, @Body('checklist') checklist: Record<string, boolean>) {
    return this.svc.updateDocumentChecklist(req.user.sub, id, checklist);
  }

  @Delete('applications/:id')
  @ApiOperation({ summary: 'Remove a tracked application' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.removeApplication(req.user.sub, id);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get AI-generated application timeline' })
  timeline(@Request() req: any) {
    return this.svc.getAiTimeline(req.user.sub);
  }
}
