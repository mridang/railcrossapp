import { Probot } from 'probot';
import SchedulerService from './scheduler.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export default class RailcrossProbot {
  constructor(private readonly schedulerService: SchedulerService) {
    //
  }

  init(): (p: Probot) => void {
    const schedulerService: SchedulerService = this.schedulerService;
    return (app: Probot) => {
      const logger = new Logger(RailcrossProbot.name);

      app.on('installation.created', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`New app installation for @${account.login}`);

        for (const repo of context.payload?.repositories || []) {
          logger.log(`Configuring schedules and rules for ${repo.full_name}`);
          await schedulerService.addLockSchedules(repo.full_name, id);
        }
      });

      app.on('installation_repositories.added', async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`Some repositories added on @${account.login}`);

        for (const repo of context.payload?.repositories_added || []) {
          logger.log(`Adding schedules and rules for ${repo.full_name}`);
          await schedulerService.addLockSchedules(repo.full_name, id);
        }
      });

      app.on('installation_repositories.removed', async (context) => {
        const { account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories_removed || []) {
          logger.log(`Removing schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(repo.full_name);
        }
      });

      app.on('installation.deleted', async (context) => {
        const { account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories || []) {
          logger.log(`Uninstalling schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(repo.full_name);
        }
      });
    };
  }
}
