import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('telegram')
  loginWithTelegram(@Body() dto: TelegramLoginDto) {
    return this.authService.loginWithTelegram(dto);
  }
}
