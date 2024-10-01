import { WebhookHandler } from '../github/webhook/webhook.interfaces';
import SchedulerService from './scheduler.service';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export default class ProbotHandler {
  constructor(
    readonly schedulerService: SchedulerService,
    @Inject(WebhookHandler)
    readonly webhookHandler: WebhookHandler,
  ) {
    const logger = new Logger(ProbotHandler.name);

    this.webhookHandler.on('installation.created', async (context) => {
      const { id, account } = context.payload.installation;
      logger.log(`New app installation for @${account.login}`);

      for (const repo of context.payload?.repositories || []) {
        logger.log(`Configuring schedules and rules for ${repo.full_name}`);
        await schedulerService.addLockSchedules(repo.full_name, id);
      }
    });

    this.webhookHandler.on(
      'installation_repositories.added',
      async (context) => {
        const { id, account } = context.payload.installation;
        logger.log(`Some repositories added on @${account.login}`);

        for (const repo of context.payload?.repositories_added || []) {
          logger.log(`Adding schedules and rules for ${repo.full_name}`);
          await schedulerService.addLockSchedules(repo.full_name, id);
        }
      },
    );

    this.webhookHandler.on(
      'installation_repositories.removed',
      async (context) => {
        const { account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories_removed || []) {
          logger.log(`Removing schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(repo.full_name);
        }
      },
    );

    this.webhookHandler.on('installation.deleted', async (context) => {
      const { account } = context.payload.installation;
      logger.log(`Some repositories removed on @${account.login}`);

      for (const repo of context.payload?.repositories || []) {
        logger.log(`Uninstalling schedules and rules for ${repo.full_name}`);
        await schedulerService.deleteSchedules(repo.full_name);
      }
    });
  }
}
