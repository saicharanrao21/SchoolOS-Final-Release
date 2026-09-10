import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: 'refresh_token is required' })
  refreshToken: string;
}
