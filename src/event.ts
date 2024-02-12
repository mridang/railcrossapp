import { getSecret } from './utils';

import { Octokit } from '@octokit/rest';

import { createAppAuth } from '@octokit/auth-app';
import ProtectionService from './protection.service';
import pino from 'pino';
import { secretName } from './constants';

const railcrossService = new ProtectionService();
const logger = pino({
  level: 'info',
});

exports.unlock = async ({
  installation_id,
  repo_name,
}: {
  repo_name: string;
  installation_id: number;
}) => {
  logger.info(`Locking repository ${repo_name}`);
  const secret = await getSecret(secretName);
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: secret.APP_ID,
      privateKey: secret.PRIVATE_KEY.replaceAll('&', '\n'),
      secret: secret.WEBHOOK_SECRET,
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(repo_name, octokit, true);
};

exports.unlock = async ({
  installation_id,
  repo_name,
}: {
  repo_name: string;
  installation_id: number;
}) => {
  logger.info(`Unlocking repository ${repo_name}`);
  const secret = await getSecret(secretName);
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: secret.APP_ID,
      privateKey: secret.PRIVATE_KEY.replaceAll('&', '\n'),
      secret: secret.WEBHOOK_SECRET,
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(repo_name, octokit, false);
};
