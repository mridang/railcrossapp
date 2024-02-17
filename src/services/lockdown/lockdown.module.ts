import {Module} from '@nestjs/common';
import {WebhookController} from './webhook.controller';
import ProtectionService from './protection.service';
import SchedulerService from './scheduler.service';
import {roleName, scheduleGroup, secretName} from '../../constants';
import {createProbot} from 'probot';
import LockdownProbot from './probot.handler';
import {SchedulerClient} from "@aws-sdk/client-scheduler";
import GithubConfig from "./github.config";
import {Octokit} from "@octokit/rest";
import {createAppAuth} from "@octokit/auth-app";

@Module({
    controllers: [WebhookController],
    providers: [
        ProtectionService,
        SchedulerService,
        LockdownProbot,
        GithubConfig,
        {
            inject: [
                GithubConfig,
                LockdownProbot
            ],
            provide: 'PROBOT',
            useFactory: async (githubConfig: GithubConfig, lockdownProbot: LockdownProbot) => {
                const secret = await githubConfig.getSecret(secretName);

                const probot = createProbot({
                    overrides: {
                        ...secret
                    },
                });

                await probot.load(lockdownProbot.init());

                return probot;
            },
        },
        {
            provide: 'SCHEDULER_CLIENT',
            useFactory: () => {
                return new SchedulerClient()
            }
        },
        {
            provide: 'SCHEDULER_GROUP',
            useFactory: () => {
                return scheduleGroup
            }
        },
        {
            provide: 'SCHEDULER_ROLE',
            useFactory: () => {
                return `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`
            }
        },
        {
            inject: [
                GithubConfig,
            ],
            provide: 'GITHUB_FN',
            useFactory: async (githubConfig: GithubConfig) => {
                const secret = await githubConfig.getSecret(secretName)

                return (installationId: number) => {
                    return new Octokit({
                        authStrategy: createAppAuth,
                        auth: {
                            ...secret,
                            installationId: installationId,
                        },
                    })
                }
            }
        }
    ],
    exports: [
        //
    ],
})
export class LockdownModule {
    //
}
