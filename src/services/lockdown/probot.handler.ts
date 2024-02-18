import { Probot } from 'probot';
import ProtectionService from './protection.service';
import SchedulerService from './scheduler.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export default class LockdownProbot {
  constructor(
    private readonly railcrossService: ProtectionService,
    private readonly schedulerService: SchedulerService,
  ) {
    //
  }

  init(): (p: Probot) => void {
    const railcrossService: ProtectionService = this.railcrossService;
    const schedulerService: SchedulerService = this.schedulerService;
    return (app: Probot) => {
      const logger = new Logger(LockdownProbot.name);

      app.on('installation.created', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`New app installation for @${account.login}`);

        for (const repo of context.payload?.repositories || []) {
          logger.log(`Configuring schedules and rules for ${repo.full_name}`);
          await schedulerService.addLockSchedules(repo.full_name, id);
          await railcrossService.toggleProtection(repo.full_name, id, true);
        }
      });

      app.on('installation_repositories.added', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`Some repositories added on @${account.login}`);

        for (const repo of context.payload?.repositories_added || []) {
          logger.log(`Adding schedules and rules for ${repo.full_name}`);
          await schedulerService.addLockSchedules(repo.full_name, id);
          await railcrossService.toggleProtection(repo.full_name, id, true);
        }
      });

      app.on('installation_repositories.removed', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories_removed || []) {
          logger.log(`Removing schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(repo.full_name);
        }
      });

      app.on('installation.deleted', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories || []) {
          logger.log(`Uninstalling schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(repo.full_name);
        }
      });
    };
  }
}
