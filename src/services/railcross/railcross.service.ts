import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import SchedulerService from './scheduler.service';
import {
  lastValueFrom,
  mergeMap,
  from,
  forkJoin,
  map,
  toArray,
  tap,
  filter,
} from 'rxjs';
import { Logger } from 'testcontainers/build/common';

@Injectable()
export default class RailcrossService {
  private readonly logger: Logger = new Logger(RailcrossService.name);

  constructor(private readonly schedulerService: SchedulerService) {
    //
  }

  async listSchedules(userOctokit: Octokit): Promise<
    {
      installationId: number;
      repoId: number;
      repoName: string;
      lockTime?: string;
      unlockTime?: string;
    }[]
  > {
    return await lastValueFrom(
      from(
        userOctokit.paginate(
          userOctokit.rest.apps.listInstallationsForAuthenticatedUser,
          { per_page: 100 },
        ) as unknown as Awaited<
          ReturnType<
            typeof userOctokit.rest.apps.listInstallationsForAuthenticatedUser
          >
        >['data']['installations'][],
      ).pipe(
        mergeMap((installations) => from(installations)),
        tap((installation) => {
          this.logger.info(`Listing repositories for ${installation.id}`);
        }),
        mergeMap((installation) =>
          from(
            userOctokit.paginate(
              userOctokit.rest.apps.listInstallationReposForAuthenticatedUser,
              {
                per_page: 100,
                installation_id: installation.id,
              },
            ) as unknown as Awaited<
              ReturnType<
                typeof userOctokit.rest.apps.listInstallationReposForAuthenticatedUser
              >
            >['data']['repositories'][],
          ).pipe(
            mergeMap((repositories) => from(repositories)),
            tap((repository) => {
              this.logger.info(
                `Fetching schedules for ${repository.full_name}`,
              );
            }),
            mergeMap((repository) =>
              forkJoin({
                lock: from(
                  this.schedulerService.getSchedule(
                    installation.id,
                    repository.id,
                    'locker',
                  ),
                ),
                unlock: from(
                  this.schedulerService.getSchedule(
                    installation.id,
                    repository.id,
                    'unlocker',
                  ),
                ),
              }).pipe(
                map(({ lock, unlock }) => ({
                  installationId: installation.id,
                  repoId: repository.id,
                  updatedAt: repository.updated_at,
                  repoName: repository.full_name,
                  lockTime: lock
                    ? `${lock.ScheduleExpression} ${lock.ScheduleExpressionTimezone}`
                    : undefined,
                  unlockTime: unlock
                    ? `${unlock.ScheduleExpression} ${unlock.ScheduleExpressionTimezone}`
                    : undefined,
                })),
              ),
            ),
            toArray(),
            map((results) =>
              results.sort(
                (a, b) =>
                  (b.updatedAt ? new Date(b.updatedAt).getTime() : -Infinity) -
                  (a.updatedAt ? new Date(a.updatedAt).getTime() : -Infinity),
              ),
            ),
          ),
        ),
      ),
    );
  }

  async resetSchedules(userOctokit: Octokit): Promise<void> {
    return await from(
      userOctokit.paginate(
        userOctokit.rest.apps.listInstallationsForAuthenticatedUser,
        { per_page: 100 },
      ) as unknown as Awaited<
        ReturnType<
          typeof userOctokit.rest.apps.listInstallationsForAuthenticatedUser
        >
      >['data']['installations'][],
    )
      .pipe(
        mergeMap((installations) => from(installations)),
        tap((installation) => {
          this.logger.info(`Listing repositories for ${installation.id}`);
        }),
        mergeMap((installation) =>
          from(
            userOctokit.paginate(
              userOctokit.rest.apps.listInstallationReposForAuthenticatedUser,
              {
                per_page: 100,
                installation_id: installation.id,
              },
            ) as unknown as Awaited<
              ReturnType<
                typeof userOctokit.rest.apps.listInstallationReposForAuthenticatedUser
              >
            >['data']['repositories'][],
          ).pipe(
            mergeMap((repositories) => from(repositories)),
            tap((repository) => {
              this.logger.info(
                `Fetching schedules for ${repository.full_name}`,
              );
            }),
            mergeMap((repository) =>
              from(
                this.schedulerService.deleteSchedules(
                  installation.id,
                  repository.id,
                ),
              ),
            ),
          ),
        ),
      )
      .forEach(() => {});
  }

  async updateSchedules(
    userOctokit: Octokit,
    repoIds: number[],
    lockTime: number,
    unlockTime: number,
    timeZone: string,
  ): Promise<void> {
    return await from(
      userOctokit.paginate(
        userOctokit.rest.apps.listInstallationsForAuthenticatedUser,
        { per_page: 100 },
      ) as unknown as Awaited<
        ReturnType<
          typeof userOctokit.rest.apps.listInstallationsForAuthenticatedUser
        >
      >['data']['installations'][],
    )
      .pipe(
        mergeMap((installations) => from(installations)),
        tap((installation) => {
          this.logger.info(`Listing repositories for ${installation.id}`);
        }),
        mergeMap((installation) =>
          from(
            userOctokit.paginate(
              userOctokit.rest.apps.listInstallationReposForAuthenticatedUser,
              {
                per_page: 100,
                installation_id: installation.id,
              },
            ) as unknown as Awaited<
              ReturnType<
                typeof userOctokit.rest.apps.listInstallationReposForAuthenticatedUser
              >
            >['data']['repositories'][],
          ).pipe(
            mergeMap((repositories) => from(repositories)),
            filter((repository) => {
              return !repoIds.length || repoIds.includes(repository.id);
            }),
            tap((repository) => {
              this.logger.info(
                `Fetching schedules for ${repository.full_name}`,
              );
            }),
            mergeMap((repository) =>
              from(
                this.schedulerService.deleteSchedules(
                  installation.id,
                  repository.id,
                ),
              ).pipe(
                mergeMap(() =>
                  forkJoin({
                    lock: from(
                      this.schedulerService.createSchedule(
                        installation.id,
                        repository.id,
                        repository.full_name,
                        lockTime,
                        timeZone,
                        'locker',
                      ),
                    ),
                    unlock: from(
                      this.schedulerService.createSchedule(
                        installation.id,
                        repository.id,
                        repository.full_name,
                        unlockTime,
                        timeZone,
                        'unlocker',
                      ),
                    ),
                  }),
                ),
              ),
            ),
            toArray(),
          ),
        ),
      )
      .forEach(() => {});
  }
}
