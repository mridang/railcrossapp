import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import ProtectionService from './protection.service';
import SchedulerService from './scheduler.service';
import { roleName, scheduleGroup, secretName } from '../../constants';
import { createProbot } from 'probot';
import RailcrossProbot from './probot.handler';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import GithubConfig from './github.config';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { SetupController } from './setup.controller';
import RailcrossService from './railcross.service';
import ProbotHandler from './probot.handler';
import { retry } from '@octokit/plugin-retry';
import path from 'path';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const MyOctokit = Octokit.plugin(retry);

@Module({
  controllers: [WebhookController, SetupController],
  providers: [
    ProtectionService,
    SchedulerService,
    RailcrossService,
    RailcrossProbot,
    {
      provide: 'ENV_PATH',
      useValue: process.env.ENV_PATH || path.resolve(process.cwd(), '.env'),
    },
    {
      provide: 'SECRETS_MANAGER_CLIENT',
      useFactory: () => {
        return new SecretsManagerClient();
      },
    },
    GithubConfig,
    {
      inject: [GithubConfig, ProbotHandler],
      provide: 'PROBOT',
      useFactory: async (
        githubConfig: GithubConfig,
        probotHandler: ProbotHandler,
      ) => {
        const secret = await githubConfig.getSecret(secretName);

        const probot = createProbot({
          overrides: {
            ...secret,
          },
        });

        await probot.load(probotHandler.init());

        return probot;
      },
    },
    {
      provide: 'SCHEDULER_CLIENT',
      useFactory: () => {
        return new SchedulerClient();
      },
    },
    {
      provide: 'SCHEDULER_GROUP',
      useFactory: () => {
        return scheduleGroup;
      },
    },
    {
      provide: 'SCHEDULER_ROLE',
      useFactory: () => {
        return `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`;
      },
    },
    {
      inject: [GithubConfig],
      provide: 'GITHUB_FN',
      useFactory: async (githubConfig: GithubConfig) => {
        const secret = await githubConfig.getSecret(secretName);

        return (installationId: number) => {
          return new MyOctokit({
            authStrategy: createAppAuth,
            auth: {
              appId: secret.appId,
              privateKey: secret.privateKey,
              installationId: installationId,
            },
            retry: {
              doNotRetry: ['429'],
            },
          });
        };
      },
    },
  ],
  exports: [
    //
  ],
})
export class RailcrossModule {
  //
}
