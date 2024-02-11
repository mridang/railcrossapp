import { getSecret } from './utils';
import { EventBridgeEvent } from 'aws-lambda';

import { Octokit } from '@octokit/rest';

import { createAppAuth } from '@octokit/auth-app';
import Service from './service';
import pino from 'pino';

const railcrossService = new Service();
const logger = pino({
  level: 'info',
});

exports.lock = async (event: EventBridgeEvent<string, any>) => {
  console.log(event);
  const { repo_name, installation_id } = JSON.parse(event.detail) as {
    repo_name: string;
    installation_id: number;
  };

  logger.info(`Locking repository ${repo_name}`);
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      ...(await getSecret('LockdownAppConfig')),
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(installation_id, octokit, true);
};

exports.unlock = async (event: EventBridgeEvent<string, any>) => {
  console.log(event);
  const { repo_name, installation_id } = JSON.parse(event.detail) as {
    repo_name: string;
    installation_id: number;
  };

  logger.info(`Unlocking repository ${repo_name}`);
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      ...(await getSecret('LockdownAppConfig')),
      installationId: installation_id,
    },
  });

  await railcrossService.toggleProtection(
    installation_id,
    octokit as any,
    false,
  );
};
