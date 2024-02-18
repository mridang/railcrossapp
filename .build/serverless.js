'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const package_json_1 = __importDefault(require('./package.json'));
const constants_1 = require('./src/constants');
const serverlessConfiguration = {
  service: package_json_1.default.name,
  frameworkVersion: '3',
  plugins: ['serverless-plugin-typescript', 'serverless-offline'],
  package: {
    individually: false,
  },
  provider: {
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      ACCOUNT_ID: '${aws:accountId}',
    },
    name: 'aws',
    runtime: `nodejs${package_json_1.default.engines.node}`,
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
      RailcrossSchedulerRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: constants_1.roleName,
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
          Name: constants_1.scheduleGroup,
        },
      },
      MySecretsManagerSecret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: constants_1.secretName,
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
//# sourceMappingURL=serverless.js.map
