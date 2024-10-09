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

    this.webhookHandler.on(
      'installation_repositories.removed',
      async (context) => {
        const { id: installationId, account } = context.payload.installation;
        logger.log(`Some repositories removed on @${account.login}`);

        for (const repo of context.payload?.repositories_removed || []) {
          logger.log(`Removing schedules and rules for ${repo.full_name}`);
          await schedulerService.deleteSchedules(installationId, repo.id);
        }
      },
    );

    this.webhookHandler.on('installation.deleted', async (context) => {
      const { id: installationId, account } = context.payload.installation;
      logger.log(`Some repositories removed on @${account.login}`);

      logger.log(`Uninstalling schedules and rules for ${installationId}`);
      await schedulerService.deleteSchedules(installationId);
    });
  }
}
