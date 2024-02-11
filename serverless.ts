import type { AWS } from '@serverless/typescript';
import packageJson from './package.json';
import { AwsLambdaRuntime } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: packageJson.name,
  frameworkVersion: '3',
  plugins: ['serverless-plugin-typescript', 'serverless-offline'],
  package: {
    individually: false,
  },
  provider: {
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
    },
    name: 'aws',
    runtime: `nodejs${packageJson.engines.node}` as AwsLambdaRuntime,
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: 'lambda:InvokeFunction',
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: 'scheduler:CreateSchedule',
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:scheduler',
                  { Ref: 'AWS::Region' },
                  { Ref: 'AWS::AccountId' },
                  'schedule-group/railcross-lock-unlock-schedules',
                ],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: ['secretsmanager:GetSecretValue'],
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:secretsmanager',
                  { Ref: 'AWS::Region' },
                  { Ref: 'AWS::AccountId' },
                  'secret',
                  'LockdownAppConfig-*',
                ],
              ],
            },
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      RailcrossScheduleGroup: {
        Type: 'AWS::Scheduler::ScheduleGroup',
        Properties: {
          Name: 'railcross-lock-unlock-schedules',
        },
      },
      MySecretsManagerSecret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: 'LockdownAppConfig',
          Description: 'Secrets for my Github application',
          SecretString: JSON.stringify({
            APP_ID: '823576',
            CLIENT_ID: 'Iv1.9cb1f44a09b79eb0',
            CLIENT_SECRET: '',
            WEBHOOK_SECRET: 'yoloyoloyoloyoloyoloyolo',
            PRIVATE_KEY: '',
          }),
        },
      },
    },
  },
  functions: {
    probot: {
      handler: 'src/lambda.handler',
      timeout: 60,
      url: true,
    },
    test: {
      handler: 'src/test.handler',
      timeout: 60,
      url: true,
    },
    locker: {
      handler: 'src/event.lock',
      timeout: 60,
    },
    unlocker: {
      handler: 'src/event.unlock',
      timeout: 60,
    },
  },
};

module.exports = serverlessConfiguration;
