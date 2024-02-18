"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const client_scheduler_1 = require("@aws-sdk/client-scheduler");
const constants_1 = require("../../constants");
const common_1 = require("@nestjs/common");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    scheduler;
    group;
    schedulerRoleArn;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(scheduler = new client_scheduler_1.SchedulerClient(), group = constants_1.scheduleGroup, schedulerRoleArn = `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${constants_1.roleName}`) {
        this.scheduler = scheduler;
        this.group = group;
        this.schedulerRoleArn = schedulerRoleArn;
        this.logger.log(`Scheduler will use role ${this.schedulerRoleArn}`);
    }
    async addLockSchedules(repoName, installationId) {
        const unlockCommand = new client_scheduler_1.CreateScheduleCommand({
            Name: `${repoName}-unlock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            GroupName: this.group,
            ScheduleExpressionTimezone: 'UTC',
            ScheduleExpression: `cron(0 8 ? * * *)`,
            FlexibleTimeWindow: { Mode: client_scheduler_1.FlexibleTimeWindowMode.OFF },
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
            this.logger.log(`Adding a unlock schedule named ${Name} to run at ${Crontab} in group ${this.group}`);
        }
        await this.scheduler.send(unlockCommand);
        const lockCommand = new client_scheduler_1.CreateScheduleCommand({
            Name: `${repoName}-lock`.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            GroupName: this.group,
            ScheduleExpressionTimezone: 'UTC',
            ScheduleExpression: `cron(0 16 ? * * *)`,
            FlexibleTimeWindow: { Mode: client_scheduler_1.FlexibleTimeWindowMode.OFF },
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
            this.logger.log(`Adding a lock schedule named ${Name} to run at ${Crontab} in group ${this.group}`);
        }
        await this.scheduler.send(lockCommand);
    }
    async updateSchedules(repoName, lockTime, unlockTime, timeZone) {
        const schedules = await this.scheduler.send(new client_scheduler_1.ListSchedulesCommand({
            GroupName: this.group,
            NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            MaxResults: 100,
        }));
        for (const schedule of schedules.Schedules || []) {
            this.logger.log(`Updating all schedules named ${schedule.Name}* in group ${this.group}`);
            if (schedule.Name === undefined) {
                throw new Error();
            }
            else if (schedule.Name.includes('-lock')) {
                await this.scheduler.send(new client_scheduler_1.UpdateScheduleCommand({
                    ScheduleExpressionTimezone: timeZone,
                    ScheduleExpression: `cron(0 ${lockTime} ? * * *)`,
                    FlexibleTimeWindow: { Mode: client_scheduler_1.FlexibleTimeWindowMode.OFF },
                    // @ts-expect-error since this cannot be empty
                    Target: schedule.Target,
                    Name: schedule.Name,
                }));
            }
            else if (schedule.Name.includes('-unlock')) {
                await this.scheduler.send(new client_scheduler_1.UpdateScheduleCommand({
                    ScheduleExpressionTimezone: timeZone,
                    ScheduleExpression: `cron(0 ${unlockTime} ? * * *)`,
                    FlexibleTimeWindow: { Mode: client_scheduler_1.FlexibleTimeWindowMode.OFF },
                    // @ts-expect-error since this cannot be empty
                    Target: schedule.Target,
                    Name: schedule.Name,
                }));
            }
            else {
                throw new Error();
            }
        }
    }
    async deleteSchedules(repoName) {
        const schedules = await this.scheduler.send(new client_scheduler_1.ListSchedulesCommand({
            GroupName: this.group,
            NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            MaxResults: 100,
        }));
        for (const schedule of schedules.Schedules || []) {
            this.logger.log(`Deleting all schedules named ${schedule.Name}* in group ${this.group}`);
            await this.scheduler.send(new client_scheduler_1.DeleteScheduleCommand({
                Name: schedule.Name,
                GroupName: this.group,
            }));
        }
    }
    async listSchedules(repoName) {
        const schedules = await this.scheduler.send(new client_scheduler_1.ListSchedulesCommand({
            GroupName: this.group,
            NamePrefix: repoName.replace(/[^0-9a-zA-Z-_.]/g, '--'),
            MaxResults: 100,
        }));
        return await Promise.all((schedules.Schedules || []).map(async (schedule) => {
            return await this.scheduler.send(new client_scheduler_1.GetScheduleCommand({
                Name: schedule.Name,
            }));
        }));
    }
};
SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SCHEDULER_CLIENT')),
    __param(1, (0, common_1.Inject)('SCHEDULER_GROUP')),
    __param(2, (0, common_1.Inject)('SCHEDULER_ROLE')),
    __metadata("design:paramtypes", [client_scheduler_1.SchedulerClient, String, String])
], SchedulerService);
exports.default = SchedulerService;
//# sourceMappingURL=scheduler.service.js.map