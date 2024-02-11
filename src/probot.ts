import { Probot } from 'probot';
import pino from 'pino';
import Service from './service';

const logger = pino({
  level: 'info',
});

const railcrossService = new Service();

export default (app: Probot) => {
  app.on('installation.created', async (context) => {
    const { installation } = context.payload;
    const accountLogin = installation.account.login;
    logger.info(`New app installation for @${accountLogin}`);

    await railcrossService.toggleProtection(
      installation.id,
      context.octokit as any,
      true,
    );
  });

  app.on('installation_repositories.added', async (context) => {
    const { installation } = context.payload;
    const accountLogin = installation.account.login;
    logger.info(`Some repositories added on @${accountLogin}`);

    await railcrossService.toggleProtection(
      installation.id,
      context.octokit as any,
      true,
    );
  });

  app.on('installation_repositories.removed', async (context) => {
    const { installation } = context.payload;
    const accountLogin = installation.account.login;
    logger.info(`Some repositories removed on @${accountLogin}`);

    await railcrossService.toggleProtection(
      installation.id,
      context.octokit as any,
      true,
    );
  });
};
