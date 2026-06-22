import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RequestUser } from '../../shared/types/request-user.type';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  unreadCount(@CurrentUser() user: RequestUser) {
    return this.notificationService.unreadCount(user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notificationService.markAllRead(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationService.list(user.id, query);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(
    @CurrentUser() user: RequestUser,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationService.markRead(user.id, notificationId);
  }
}
