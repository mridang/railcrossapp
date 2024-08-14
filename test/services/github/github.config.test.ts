import { expect } from '@jest/globals';
import {
  CreateSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { TextEncoder } from 'util';
import GithubConfig from '../../../src/services/github/github.config';
import { join } from 'path';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('github.config tests', () => {
  const secretsManagerClient = new SecretsManagerClient({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });

  test('should read secrets from SecretString', async () => {
    const githubConfig: GithubConfig = new GithubConfig(
      './.env.test',
      secretsManagerClient,
    );
    const secretName = 'TestSecretString';
    const secretValue = JSON.stringify({
      APP_ID: 'appId',
      CLIENT_ID: 'clientId',
      CLIENT_SECRET: 'clientSecret',
      PRIVATE_KEY: 'privateKey',
      WEBHOOK_SECRET: 'webhookSecret',
    });

    await secretsManagerClient.send(
      new CreateSecretCommand({
        Name: secretName,
        SecretString: secretValue,
      }),
    );

    const secrets = await githubConfig.getSecret(secretName);
    expect(secrets).toEqual({
      appId: 'appId',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      privateKey: 'privateKey',
      secret: 'webhookSecret',
    });
  });

  test('should read secrets from .env file', async () => {
    const envPath = join(mkdtempSync(join(tmpdir(), 'githubConfig-')), '.env');
    const envContent = `
APP_ID=appIdFromEnv
CLIENT_ID=clientIdFromEnv
CLIENT_SECRET=clientSecretFromEnv
PRIVATE_KEY=privateKeyFromEnv
WEBHOOK_SECRET=webhookSecretFromEnv
    `.trim();

    writeFileSync(envPath, envContent);

    const githubConfig = new GithubConfig(envPath, secretsManagerClient);

    const secrets = await githubConfig.getSecret('');
    expect(secrets).toEqual({
      appId: 'appIdFromEnv',
      clientId: 'clientIdFromEnv',
      clientSecret: 'clientSecretFromEnv',
      privateKey: 'privateKeyFromEnv',
      secret: 'webhookSecretFromEnv',
    });
  });

  test('should read secrets from SecretBinary', async () => {
    const githubConfig: GithubConfig = new GithubConfig(
      './.env.test',
      secretsManagerClient,
    );
    const secretName = 'TestSecretBinary';
    const encoder = new TextEncoder();
    const secretBinary = encoder.encode(
      JSON.stringify({
        APP_ID: 'appIdBinary',
        CLIENT_ID: 'clientIdBinary',
        CLIENT_SECRET: 'clientSecretBinary',
        PRIVATE_KEY: 'privateKey&Binary',
        WEBHOOK_SECRET: 'webhookSecretBinary',
      }),
    );

    await secretsManagerClient.send(
      new CreateSecretCommand({
        Name: secretName,
        SecretBinary: secretBinary,
      }),
    );

    const secrets = await githubConfig.getSecret(secretName);
    expect(secrets).toEqual({
      appId: 'appIdBinary',
      clientId: 'clientIdBinary',
      clientSecret: 'clientSecretBinary',
      privateKey: 'privateKey\nBinary',
      secret: 'webhookSecretBinary',
    });
  });
});
