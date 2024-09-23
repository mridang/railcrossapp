import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Redirect,
  Render,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';
import { IsSupportedTimeZone } from './timezone.validator';
import RailcrossService from './railcross.service';
import { Request } from 'express';
import { from, mergeMap, map, toArray, lastValueFrom } from 'rxjs';
import Repository from '../github/types';
import { Octokit } from '@octokit/rest';
import { OctokitImpl } from '../github/octokit/types';

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

@Controller('app')
export class SetupController {
  constructor(
    private readonly railcrossService: RailcrossService,
    @Inject(OctokitImpl)
    private readonly octokitFn: (
      accessTokenOrInstallationId: number | string,
    ) => Octokit,
  ) {
    //
  }

  @Get('setup')
  @Render('setup')
  async showSetup(@Req() request: Request) {
    // noinspection TypeScriptUnresolvedReference
    // @ts-expect-error since
    const accessToken: string = request.user.accessToken;
    if (!accessToken) {
      throw new UnauthorizedException('Unable to deduce allowed installations');
    } else {
      const octokit = this.octokitFn(accessToken);
      const userRepos = await lastValueFrom(
        from(
          octokit.paginate(octokit.apps.listInstallationsForAuthenticatedUser, {
            per_page: 100,
          }),
        ).pipe(
          mergeMap((installations) =>
            from(installations.map((installation) => installation.id)).pipe(
              mergeMap((installationId) =>
                from(
                  octokit.paginate(
                    octokit.apps.listInstallationReposForAuthenticatedUser,
                    {
                      per_page: 100,
                      installation_id: installationId,
                    },
                  ),
                ).pipe(
                  map((repositories) =>
                    repositories.repositories.map((repository) => ({
                      ownerRepo: new Repository(repository.full_name),
                      installationId,
                    })),
                  ),
                ),
              ),
            ),
          ),
          toArray(),
          map((flattened) => flattened.flat()),
        ),
      );

      const repoSchedules = await Promise.all(
        userRepos.map(async (userRepo) => {
          return await this.railcrossService.listSchedules(
            userRepo.ownerRepo.fullName,
          );
        }),
      );

      return {
        timezones: Intl.supportedValuesOf('timeZone'),
        repoSchedules,
        installationIds: userRepos
          .map((userRepo) => userRepo.installationId)
          .filter((value, index, self) => self.indexOf(value) === index),
      };
    }
  }

  @Post('setup')
  @Redirect('/app/setup', HttpStatus.FOUND)
  async updateSetup(@Body() scheduleDto: ScheduleDto, @Req() request: Request) {
    // noinspection TypeScriptUnresolvedReference
    // @ts-expect-error since
    const installationIds: number[] = request.user.installationIds;
    if (!installationIds.includes(scheduleDto.installation_id)) {
      throw new UnauthorizedException('Unable to deduce allowed installations');
    } else {
      if (scheduleDto.lock_time <= scheduleDto.unlock_time) {
        throw new BadRequestException('Lock time must be after unlock time.');
      }

      await this.railcrossService.updateSchedules(
        scheduleDto.installation_id,
        scheduleDto.lock_time,
        scheduleDto.unlock_time,
        scheduleDto.timezone,
      );
    }
  }
}
