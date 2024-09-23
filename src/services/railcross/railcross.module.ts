import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import ProtectionService from './protection.service';
import SchedulerService from './scheduler.service';
import { roleName, scheduleGroup } from '../../constants';
import { createProbot } from 'probot';
import RailcrossProbot from './probot.handler';
import ProbotHandler from './probot.handler';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import { SetupController } from './setup.controller';
import RailcrossService from './railcross.service';
import { GithubModule } from '../github/github.module';
import { ConfigService } from '@nestjs/config';
import { OctokitModule } from '../github/octokit/octokit.module';

@Module({
  controllers: [WebhookController, SetupController],
  providers: [
    ProtectionService,
    SchedulerService,
    RailcrossService,
    RailcrossProbot,
    {
      provide: 'SCHEDULER_CLIENT',
      useFactory: () => {
        return new SchedulerClient({
          maxAttempts: 10,
        });
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
      inject: [ConfigService, ProbotHandler],
      provide: 'PROBOT',
      useFactory: async (
        configService: ConfigService,
        probotHandler: ProbotHandler,
      ) => {
        const probot = createProbot({
          overrides: {
            secret: configService.getOrThrow('GITHUB_WEBHOOK_SECRET'),
            appId: configService.getOrThrow('GITHUB_APP_ID'),
            privateKey: configService
              .getOrThrow('GITHUB_PRIVATE_KEY')
              .replaceAll('&', '\n'),
          },
        });

        await probot.load(probotHandler.init());

        return probot;
      },
    },
  ],
  imports: [OctokitModule, GithubModule],
  exports: [
    //
  ],
})
export class RailcrossModule {
  //
}
