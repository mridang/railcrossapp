'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.RailcrossModule = void 0;
const common_1 = require('@nestjs/common');
const webhook_controller_1 = require('./webhook.controller');
const protection_service_1 = __importDefault(require('./protection.service'));
const scheduler_service_1 = __importDefault(require('./scheduler.service'));
const constants_1 = require('../../constants');
const probot_1 = require('probot');
const probot_handler_1 = __importDefault(require('./probot.handler'));
const client_scheduler_1 = require('@aws-sdk/client-scheduler');
const github_config_1 = __importDefault(require('./github.config'));
const rest_1 = require('@octokit/rest');
const auth_app_1 = require('@octokit/auth-app');
const setup_controller_1 = require('./setup.controller');
let RailcrossModule = class RailcrossModule {};
exports.RailcrossModule = RailcrossModule;
exports.RailcrossModule = RailcrossModule = __decorate(
  [
    (0, common_1.Module)({
      controllers: [
        webhook_controller_1.WebhookController,
        setup_controller_1.SetupController,
      ],
      providers: [
        protection_service_1.default,
        scheduler_service_1.default,
        probot_handler_1.default,
        github_config_1.default,
        {
          inject: [github_config_1.default, probot_handler_1.default],
          provide: 'PROBOT',
          useFactory: async (githubConfig, railcrossProbot) => {
            const secret = await githubConfig.getSecret(constants_1.secretName);
            const probot = (0, probot_1.createProbot)({
              overrides: {
                ...secret,
              },
            });
            await probot.load(railcrossProbot.init());
            return probot;
          },
        },
        {
          provide: 'SCHEDULER_CLIENT',
          useFactory: () => {
            return new client_scheduler_1.SchedulerClient();
          },
        },
        {
          provide: 'SCHEDULER_GROUP',
          useFactory: () => {
            return constants_1.scheduleGroup;
          },
        },
        {
          provide: 'SCHEDULER_ROLE',
          useFactory: () => {
            return `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${constants_1.roleName}`;
          },
        },
        {
          inject: [github_config_1.default],
          provide: 'GITHUB_FN',
          useFactory: async (githubConfig) => {
            const secret = await githubConfig.getSecret(constants_1.secretName);
            return (installationId) => {
              return new rest_1.Octokit({
                authStrategy: auth_app_1.createAppAuth,
                auth: {
                  ...secret,
                  installationId: installationId,
                },
              });
            };
          },
        },
      ],
      exports: [
        //
      ],
    }),
  ],
  RailcrossModule,
);
//# sourceMappingURL=railcross.module.js.map
