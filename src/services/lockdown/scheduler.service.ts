import {
    CreateScheduleCommand,
    DeleteScheduleCommand,
    FlexibleTimeWindowMode,
    GetScheduleCommand,
    ListSchedulesCommand,
    ListSchedulesCommandOutput,
    SchedulerClient,
    ScheduleSummary,
    UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler';
import {roleName, scheduleGroup} from '../../constants';
import {Inject, Injectable, Logger} from '@nestjs/common';

@Injectable()
export default class SchedulerService {

    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @Inject('SCHEDULER_CLIENT')
        private readonly scheduler: SchedulerClient = new SchedulerClient(),
        @Inject('SCHEDULER_GROUP')
        private readonly group: string = scheduleGroup,
        @Inject('SCHEDULER_ROLE')
        private readonly schedulerRoleArn: string = `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`,
    ) {
        this.logger.log(`Scheduler will use role ${this.schedulerRoleArn}`);
    }

    async addLockSchedules(repoName: string, installationId: number) {
        const unlockCommand = new CreateScheduleCommand({
            Name: `${repoName}-unlock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            GroupName: this.group,
            ScheduleExpressionTimezone: 'UTC',
            ScheduleExpression: `cron(0 8 ? * * *)`,
            FlexibleTimeWindow: {Mode: FlexibleTimeWindowMode.OFF},
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
            const {Name, ScheduleExpression: Crontab} = unlockCommand.input;
            this.logger.log(
                `Adding a unlock schedule named ${Name} to run at ${Crontab} in group ${this.group}`,
            );
        }
        await this.scheduler.send(unlockCommand);

        const lockCommand = new CreateScheduleCommand({
            Name: `${repoName}-lock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            GroupName: this.group,
            ScheduleExpressionTimezone: 'UTC',
            ScheduleExpression: `cron(0 16 ? * * *)`,
            FlexibleTimeWindow: {Mode: FlexibleTimeWindowMode.OFF},
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
            const {Name, ScheduleExpression: Crontab} = lockCommand.input;
            this.logger.log(
                `Adding a lock schedule named ${Name} to run at ${Crontab} in group ${this.group}`,
            );
        }
        await this.scheduler.send(lockCommand);
    }

    async updateSchedules(
        repoName: string,
        lockTime: number,
        unlockTime: number,
        timeZone: string,
    ) {
        const schedules: ListSchedulesCommandOutput = await this.scheduler.send(
            new ListSchedulesCommand({
                GroupName: this.group,
                NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
                MaxResults: 100,
            }),
        );

        for (const schedule of schedules.Schedules || []) {
            this.logger.log(
                `Updating all schedules named ${schedule.Name}* in group ${this.group}`,
            );
            if (schedule.Name === undefined) {
                throw new Error();
            } else if (schedule.Name.includes('-lock')) {
                await this.scheduler.send(
                    new UpdateScheduleCommand({
                        ScheduleExpressionTimezone: timeZone,
                        ScheduleExpression: `cron(0 ${lockTime} ? * * *)`,
                        FlexibleTimeWindow: {Mode: FlexibleTimeWindowMode.OFF},
                        // @ts-ignore
                        Target: schedule.Target,
                        Name: schedule.Name,
                    }),
                );
            } else if (schedule.Name.includes('-unlock')) {
                await this.scheduler.send(
                    new UpdateScheduleCommand({
                        ScheduleExpressionTimezone: timeZone,
                        ScheduleExpression: `cron(0 ${unlockTime} ? * * *)`,
                        FlexibleTimeWindow: {Mode: FlexibleTimeWindowMode.OFF},
                        // @ts-ignore
                        Target: schedule.Target,
                        Name: schedule.Name,
                    }),
                );
            } else {
                throw new Error();
            }
        }
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
            this.logger.log(
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

    async listSchedules(repoName: string): Promise<ScheduleSummary[]> {
        const schedules: ListSchedulesCommandOutput = await this.scheduler.send(
            new ListSchedulesCommand({
                GroupName: this.group,
                NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
                MaxResults: 100,
            }),
        );

        return await Promise.all(
            (schedules.Schedules || []).map(async (schedule) => {
                return await this.scheduler.send(
                    new GetScheduleCommand({
                        Name: schedule.Name,
                    }),
                );
            }),
        );
    }
}
