import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  ListSchedulesCommand,
  ListSchedulesCommandOutput,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { roleName, scheduleGroup } from './constants';

export default class SchedulerService {
  private schedulerRoleArn = `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`;

  constructor(private readonly scheduler = new SchedulerClient()) {
    //
  }

  async addLockSchedules(repoName: string, installationId: number) {
    await this.scheduler.send(
      new CreateScheduleCommand({
        Name: `${repoName}-unlock`,
        GroupName: scheduleGroup,
        ScheduleExpression: `cron(0 8 ? * * *)`,
        FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
        Target: {
          Arn: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:function:lockdown-dev-unlocker`,
          RoleArn: this.schedulerRoleArn,
          Input: JSON.stringify({
            repo_name: repoName,
            installation_id: installationId,
          }),
        },
      }),
    );

    await this.scheduler.send(
      new CreateScheduleCommand({
        Name: `${repoName}-lock`,
        GroupName: scheduleGroup,
        ScheduleExpression: `cron(0 16 ? * * *)`,
        FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
        Target: {
          Arn: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:function:lockdown-dev-locker`,
          RoleArn: this.schedulerRoleArn,
          Input: JSON.stringify({
            repo_name: repoName,
            installation_id: installationId,
          }),
        },
      }),
    );
  }

  async deleteSchedules(repoName: string) {
    const schedules: ListSchedulesCommandOutput = await this.scheduler.send(
      new ListSchedulesCommand({
        GroupName: scheduleGroup,
        NamePrefix: repoName,
        MaxResults: 100,
      }),
    );

    for (const schedule of schedules.Schedules || []) {
      await this.scheduler.send(
        new DeleteScheduleCommand({ Name: schedule.Name }),
      );
    }
  }
}
