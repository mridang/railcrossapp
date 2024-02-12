import { Probot } from 'probot';
import pino from 'pino';
import ProtectionService from './protection.service';
import SchedulerService from './scheduler.service';

const logger = pino({
  level: 'info',
});

const railcrossService = new ProtectionService();
const schedulerService = new SchedulerService();

export default (app: Probot) => {
  app.on('installation.created', async (context) => {
    const { id, account } = context.payload.installation;
    logger.info(`New app installation for @${account.login}`);

    for (const repo of context.payload?.repositories || []) {
      await schedulerService.addLockSchedules(repo.full_name, id);
      await railcrossService.toggleProtection(
        repo.full_name,
        context.octokit as any,
        true,
      );
    }
  });

  app.on('installation_repositories.added', async (context) => {
    const { id, account } = context.payload.installation;
    logger.info(`Some repositories added on @${account.login}`);

    for (const repo of context.payload?.repositories_added || []) {
      await schedulerService.addLockSchedules(repo.full_name, id);
      await railcrossService.toggleProtection(
        repo.full_name,
        context.octokit as any,
        true,
      );
    }
  });

  app.on('installation_repositories.removed', async (context) => {
    const { id, account } = context.payload.installation;
    logger.info(`Some repositories removed on @${account.login}`);

    for (const repo of context.payload?.repositories_removed || []) {
      await schedulerService.deleteSchedules(repo.full_name);
      await railcrossService.toggleProtection(
        repo.full_name,
        context.octokit as any,
        false,
      );
    }
  });
};
