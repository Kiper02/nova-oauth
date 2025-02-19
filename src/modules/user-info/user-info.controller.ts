import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { ClientAuthorization } from 'src/shared/decorators/client-authorization.decorator';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { ClientAuthorizationGuard } from 'src/shared/guards/client-authorization.guard';

@Controller('user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @UseGuards(ClientAuthorizationGuard)
  @Get()
  public async getUserInfo(
    @ClientAuthorization() tokenPayloadDto: TokenPayloadDto
  ) {
    return await this.userInfoService.getUserInfo(tokenPayloadDto)
  } 
}
