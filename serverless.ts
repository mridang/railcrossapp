import type { AWS } from '@serverless/typescript';
import { AwsLambdaRuntime } from '@serverless/typescript';
import packageJson from './package.json';
import { roleName, scheduleGroup, secretName } from './src/constants';

const serverlessConfiguration: AWS = {
  service: packageJson.name,
  frameworkVersion: '3',
  plugins: ['serverless-plugin-typescript', 'serverless-offline'],
  package: {
    individually: false,
    patterns: [
      'public/**/*',
      '**/*.hbs',
      '**/*.html',
      '!test',
      '!jest.config.js',
      '!jest.config.js.map',
      '!prettier.config.js',
      '!prettier.config.js.map',
      '!serverless.js',
      '!serverless.js.map',
      '!package.json',
    ],
  },
  provider: {
    stage: '${opt:stage, "dev"}',
    tags: {
      'sls:meta:project': packageJson.name,
      'sls:meta:repo': packageJson.repository.url,
      'sls:meta:environment': '${opt:stage, "dev"}',
    },
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      ACCOUNT_ID: '${aws:accountId}',
      NODE_ENV: '${self:provider.stage}',
      SERVICE_NAME: packageJson.name,
    },
    name: 'aws',
    tracing: {
      lambda: true,
    },
    runtime: `nodejs${packageJson.engines.node}` as AwsLambdaRuntime,
    architecture: 'arm64',
    memorySize: 256,
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['iam:GetRole', 'iam:PassRole'],
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:iam',
                  '',
                  { Ref: 'AWS::AccountId' },
                  'role/RailcrossSchedulerRole',
                ],
              ],
            },
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
                  'schedule/railcross-lock-unlock-schedules/*',
                ],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: 'scheduler:ListSchedules',
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:scheduler',
                  { Ref: 'AWS::Region' },
                  { Ref: 'AWS::AccountId' },
                  'schedule/*/*',
                ],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: 'scheduler:DeleteSchedule',
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:scheduler',
                  { Ref: 'AWS::Region' },
                  { Ref: 'AWS::AccountId' },
                  'schedule/railcross-lock-unlock-schedules/*',
                ],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: 'scheduler:UpdateSchedule',
            Resource: {
              'Fn::Join': [
                ':',
                [
                  'arn:aws:scheduler',
                  { Ref: 'AWS::Region' },
                  { Ref: 'AWS::AccountId' },
                  'schedule/railcross-lock-unlock-schedules/*',
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
                  `${secretName}-*`,
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
      RailcrossSchedulerRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: roleName,
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  Service: 'scheduler.amazonaws.com',
                },
                Action: 'sts:AssumeRole',
              },
            ],
          },
          Policies: [
            {
              PolicyName: 'LambdaInvokePolicy',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: 'lambda:InvokeFunction',
                    Resource: '*',
                  },
                ],
              },
            },
          ],
        },
      },
      RailcrossScheduleGroup: {
        Type: 'AWS::Scheduler::ScheduleGroup',
        Properties: {
          Name: scheduleGroup,
        },
      },
      MySecretsManagerSecret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: secretName,
          Description: 'Secrets for my Github application',
          SecretString: JSON.stringify({
            APP_ID: '',
            CLIENT_ID: '',
            CLIENT_SECRET: '',
            WEBHOOK_SECRET: '',
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
