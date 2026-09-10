import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get('global')
  async search(
    @User('org') organizationId: string,
    @User('role') role: string,
    @User('id') userId: string,
    @Query('q') query: string
  ) {
    if (!query || query.length < 2) return [];
    return this.service.globalSearch(organizationId, query, role, userId);
  }
}
