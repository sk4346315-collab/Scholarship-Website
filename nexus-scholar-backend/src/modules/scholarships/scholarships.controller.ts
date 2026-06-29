import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ScholarshipsService }    from './scholarships.service'
import { FilterScholarshipsDto }  from './dto/filter-scholarships.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Scholarships')
@Controller('api/scholarships')
export class ScholarshipsController {
  constructor(private svc: ScholarshipsService) {}

  @Get()
  @ApiOperation({ summary: 'List & filter scholarships' })
  @ApiQuery({ name: 'ieltsRequired', required: false, type: Boolean })
  @ApiQuery({ name: 'acceptsMoi', required: false, type: Boolean })
  @ApiQuery({ name: 'countries', required: false, type: String })
  @ApiQuery({ name: 'tiers', required: false, type: String })
  @ApiQuery({ name: 'fields', required: false, type: String })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('ieltsRequired') ieltsRequired?: string,
    @Query('acceptsMoi') acceptsMoi?: string,
    @Query('countries') countries?: string,
    @Query('tiers') tiers?: string,
    @Query('fields') fields?: string,
    @Query('minScore') minScore?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.svc.findAll({
      ieltsRequired: ieltsRequired === 'false' ? false : ieltsRequired === 'true' ? true : undefined,
      acceptsMoi: acceptsMoi === 'true' ? true : undefined,
      countries: countries?.split(',').filter(Boolean),
      tiers: tiers?.split(',').filter(Boolean),
      fields: fields?.split(',').filter(Boolean),
      minSuitabilityScore: minScore ? parseInt(minScore) : undefined,
    }, page, limit);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get deadlines for the next N days' })
  deadlines(@Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number) {
    return this.svc.getDeadlinesCalendar(days);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get scholarship by slug' })
  findOne(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }
}
