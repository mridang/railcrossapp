import {
  CreateScheduleCommand,
  CreateScheduleGroupCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  GetScheduleCommand,
  GetScheduleCommandOutput,
  GetScheduleGroupCommand,
  ListSchedulesCommand,
  ListSchedulesCommandOutput,
  ResourceNotFoundException,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { roleName, scheduleGroup } from '../../constants';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { from, mergeMap, tap, EMPTY, filter } from 'rxjs';

@Injectable()
export default class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @Inject('SCHEDULER_CLIENT')
    private readonly scheduler: SchedulerClient = new SchedulerClient(),
    @Inject('SCHEDULER_GROUP')
    private readonly group: string = scheduleGroup,
    @Inject('SCHEDULER_ROLE')
    private readonly schedulerRoleArn: string = `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`,
  ) {
    if (process.env.AWS_REGION === undefined) {
      throw new Error(
        'Expected AWS_REGION environment variable is not defined',
      );
    }
    if (process.env.ACCOUNT_ID === undefined) {
      throw new Error(
        'Expected ACCOUNT_ID environment variable is not defined',
      );
    }
    if (process.env.NODE_ENV === undefined) {
      throw new Error('Expected NODE_ENV environment variable is not defined');
    }

    this.logger.log(`Scheduler will use role ${this.schedulerRoleArn}`);
  }

  async onModuleInit() {
    try {
      await this.scheduler.send(
        new GetScheduleGroupCommand({ Name: this.group }),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'ResourceNotFoundException'
      ) {
        this.logger.log(
          `Schedule group "${this.group}" not found, creating it...`,
        );
        await this.scheduler.send(
          new CreateScheduleGroupCommand({ Name: this.group }),
        );
      } else {
        throw error;
      }
    }
  }

  async deleteSchedules(
    installationId: number,
    repoId?: number,
  ): Promise<void> {
    await from(
      this.scheduler.send(
        new ListSchedulesCommand({
          GroupName: this.group,
          NamePrefix: `${installationId}.${repoId === undefined ? '' : repoId + '.'}`,
          MaxResults: 100,
        }),
      ),
    )
      .pipe(
        mergeMap((res: ListSchedulesCommandOutput) =>
          from(res.Schedules || []),
        ),
        filter((schedule) => {
          return (
            schedule?.Name?.startsWith(
              `${installationId}.${repoId === undefined ? '' : repoId + '.'}`,
            ) || false
          );
        }),
        tap((schedule) => {
          this.logger.log(
            `Deleting schedule "${schedule.Name}" in group ${this.group}`,
          );
        }),
        mergeMap((schedule) =>
          schedule
            ? this.scheduler.send(
                new DeleteScheduleCommand({
                  Name: schedule.Name,
                  GroupName: this.group,
                }),
              )
            : EMPTY,
        ),
      )
      .forEach(() => {});
  }

  async createSchedule(
    installationId: number,
    repoId: number,
    repoName: string,
    cronTime: number,
    timeZone: string,
    taskName: string,
  ) {
    return await this.scheduler.send(
      new CreateScheduleCommand({
        Name: `${installationId}.${repoId}.${taskName}`,
        GroupName: this.group,
        ScheduleExpressionTimezone: timeZone,
        ScheduleExpression: `cron(0 ${cronTime} ? * * *)`,
        FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
        Target: {
          Arn: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:function:railcross-${process.env.NODE_ENV}-${taskName}`,
          RoleArn: this.schedulerRoleArn,
          Input: JSON.stringify({
            repo_name: repoName,
            installation_id: installationId,
          }),
        },
      }),
    );
  }

  async getSchedule(
    installationId: number,
    repoId: number,
    taskName: string,
  ): Promise<GetScheduleCommandOutput | null> {
    try {
      return await this.scheduler.send(
        new GetScheduleCommand({
          Name: `${installationId}.${repoId}.${taskName}`,
          GroupName: this.group,
        }),
      );
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return null;
      } else {
        throw error;
      }
    }
  }
}
