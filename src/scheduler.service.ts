import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  ListSchedulesCommand,
  ListSchedulesCommandOutput,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { roleName, scheduleGroup } from './constants';
import pino from 'pino';

export default class SchedulerService {
  private readonly logger = pino({
    level: 'info',
  });
  private schedulerRoleArn = `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`;

  constructor(
    private readonly scheduler = new SchedulerClient(),
    private readonly group = scheduleGroup,
  ) {
    this.logger.info(`Scheduler will use role ${this.schedulerRoleArn}`);
  }

  async addLockSchedules(repoName: string, installationId: number) {
    const unlockCommand = new CreateScheduleCommand({
      Name: `${repoName}-unlock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
      GroupName: this.group,
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
    });
    {
      const { Name, ScheduleExpression: Crontab } = unlockCommand.input;
      this.logger.info(
        `Adding a unlock schedule named ${Name} to run at ${Crontab} in group ${this.group}`,
      );
    }
    await this.scheduler.send(unlockCommand);

    const lockCommand = new CreateScheduleCommand({
      Name: `${repoName}-lock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
      GroupName: this.group,
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
    });

    {
      const { Name, ScheduleExpression: Crontab } = lockCommand.input;
      this.logger.info(
        `Adding a lock schedule named ${Name} to run at ${Crontab} in group ${this.group}`,
      );
    }
    await this.scheduler.send(lockCommand);
  }

  async deleteSchedules(repoName: string) {
    const schedules: ListSchedulesCommandOutput = await this.scheduler.send(
      new ListSchedulesCommand({
        GroupName: this.group,
        NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
        MaxResults: 100,
      }),
    );

    for (const schedule of schedules.Schedules || []) {
      this.logger.info(
        `Deleting all schedules named ${schedule.Name}* in group ${this.group}`,
      );
      await this.scheduler.send(
        new DeleteScheduleCommand({
          Name: schedule.Name,
          GroupName: this.group,
        }),
      );
    }
  }
}
