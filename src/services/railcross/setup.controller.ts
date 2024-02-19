import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';
import { IsSupportedTimeZone } from './timezone.validator';
import SchedulerService from './scheduler.service';
import RailcrossService from './railcross.service';

class ScheduleDto {
  @IsInt()
  @Min(0)
  @Max(23)
  lock_time!: number;

  @IsInt()
  @Min(0)
  @Max(23)
  unlock_time!: number;

  @IsInt()
  installation_id!: number;

  @IsSupportedTimeZone({ message: 'Timezone is not valid' })
  timezone!: string;
}

@Controller('setup')
export class SetupController {
  constructor(private readonly railcrossService: RailcrossService) {
    //
  }

  @Get()
  @Render('setup')
  showSetup(@Query('installation_id') installationId: string) {
    if (!installationId) {
      throw new Error('installation_id query parameter is required');
    }

    return {
      timezones: Intl.supportedValuesOf('timeZone'),
      installationId, // Pass the installationId to the template
    };
  }

  @Post()
  async updateSetup(@Body() scheduleDto: ScheduleDto) {
    if (scheduleDto.lock_time <= scheduleDto.unlock_time) {
      throw new BadRequestException('Lock time must be after unlock time.');
    }

    await this.railcrossService.updateSchedules(
      scheduleDto.installation_id,
      scheduleDto.lock_time,
      scheduleDto.unlock_time,
      scheduleDto.timezone,
    );

    return { message: 'Schedule created successfully', schedule: scheduleDto };
  }
}
