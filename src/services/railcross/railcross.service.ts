import { Inject, Injectable } from '@nestjs/common';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { Octokit } from '@octokit/rest';
import SchedulerService from './scheduler.service';

@Injectable()
export default class RailcrossService {
  constructor(
    private readonly schedulerService: SchedulerService,
    @Inject('GITHUB_FN')
    private readonly octokitFn: (
      installationId: number,
    ) => RestEndpointMethods & Api & Octokit,
  ) {
    //
  }

  async updateSchedules(
    installationId: number,
    lockTime: number,
    unlockTime: number,
    timeZone: string,
  ) {
    const octokit = this.octokitFn(installationId);
    const { data } =
      await octokit.rest.apps.listReposAccessibleToInstallation();
    for (const repo of data.repositories) {
      await this.schedulerService.updateSchedules(
        repo.full_name,
        lockTime,
        unlockTime,
        timeZone,
      );
    }
  }
}
