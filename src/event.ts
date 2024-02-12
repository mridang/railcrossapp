import { getSecret } from './utils';

import { Octokit } from '@octokit/rest';

import { createAppAuth } from '@octokit/auth-app';
import Service from './service';
import pino from 'pino';

const railcrossService = new Service();
const logger = pino({
  level: 'info',
});

exports.unlock = async ({installation_id, repo_name}: {
  repo_name: string;
  installation_id: number;
}) => {
  logger.info(`Locking repository ${repo_name}`);
  const secret = await getSecret('LockdownAppConfig');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: secret.APP_ID,
      privateKey: secret.PRIVATE_KEY.replaceAll('&', '\n'),
      secret: secret.WEBHOOK_SECRET,
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(installation_id, octokit, true);
};

exports.unlock = async ({installation_id, repo_name}: {
  repo_name: string;
  installation_id: number;
}) => {

  logger.info(`Unlocking repository ${repo_name}`);
  const secret = await getSecret('LockdownAppConfig');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: secret.APP_ID,
      privateKey: secret.PRIVATE_KEY.replaceAll('&', '\n'),
      secret: secret.WEBHOOK_SECRET,
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(installation_id, octokit, false,);
};
