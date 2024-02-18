import {BadRequestException, Body, Controller, Get, Post, Render} from '@nestjs/common';
import {IsInt, Max, Min} from 'class-validator';
import {IsSupportedTimeZone} from "./timezone.validator";
import SchedulerService from "./scheduler.service";

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

    constructor(private readonly schedulerService: SchedulerService) {
        //
    }

    @Get()
    @Render('setup')
    showSetup() {
        return {
            timezones: Intl.supportedValuesOf('timeZone'),
        };
    }

    @Post()
    async updateSetup(@Body() scheduleDto: ScheduleDto) {
        if (scheduleDto.lock_time <= scheduleDto.unlock_time) {
            throw new BadRequestException('Lock time must be after unlock time.');
        }

        //await this.schedulerService.updateSchedules(scheduleDto.installation_id, scheduleDto.lock_time, scheduleDto.unlock_time, scheduleDto.timezone)

        return { message: 'Schedule created successfully', schedule: scheduleDto };
    }
}
