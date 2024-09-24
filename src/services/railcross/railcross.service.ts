import { Inject, Injectable } from '@nestjs/common';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { Octokit } from '@octokit/rest';
import SchedulerService from './scheduler.service';
import { OctokitImpl } from '../github/octokit/types';
import { lastValueFrom, mergeMap, from, toArray } from 'rxjs';

@Injectable()
export default class RailcrossService {
  constructor(
    private readonly schedulerService: SchedulerService,
    @Inject(OctokitImpl)
    private readonly octokitFn: (
      installationId: number,
    ) => RestEndpointMethods & Api & Octokit,
  ) {
    //
  }

  async listSchedules(
    repoName: string,
  ): Promise<{ repoName: string; lockTime?: string; unlockTime?: string }> {
    const schedules = await this.schedulerService.listSchedules(repoName);
    const unlockTime = schedules
      .filter((schedule) => schedule.Name?.endsWith('-unlock'))
      .map(
        (schedule) =>
          `${schedule.ScheduleExpression} ${schedule.ScheduleExpressionTimezone}`,
      )
      .pop();

    const lockTime = schedules
      .filter((schedule) => schedule.Name?.endsWith('-lock'))
      .map(
        (schedule) =>
          `${schedule.ScheduleExpression} ${schedule.ScheduleExpressionTimezone}`,
      )
      .pop();

    return {
      repoName: repoName,
      lockTime: lockTime,
      unlockTime: unlockTime,
    };
  }

  async updateSchedules(
    installationId: number,
    lockTime: number,
    unlockTime: number,
    timeZone: string,
  ) {
    const octokit = this.octokitFn(installationId);

    await lastValueFrom(
      from(
        (await octokit.paginate(
          octokit.rest.apps.listReposAccessibleToInstallation,
        )) as unknown as Awaited<
          ReturnType<typeof octokit.rest.apps.listReposAccessibleToInstallation>
        >['data']['repositories'],
      ).pipe(
        mergeMap((repo) => {
          return from(
            this.schedulerService.updateSchedules(
              installationId,
              repo.full_name,
              lockTime,
              unlockTime,
              timeZone,
            ),
          );
        }),
        toArray(),
      ),
    );
  }
}
