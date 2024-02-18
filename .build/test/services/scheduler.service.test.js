'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const client_scheduler_1 = require('@aws-sdk/client-scheduler');
const scheduler_service_1 = __importDefault(
  require('../../src/services/railcross/scheduler.service'),
);
describe('scheduler.service test', () => {
  test('that schedules are added"', async () => {
    const schedulerService = new scheduler_service_1.default(
      new client_scheduler_1.SchedulerClient({
        endpoint: 'http://localhost:4566',
        region: 'us-east-1',
        tls: false,
      }),
      'default',
    );
    await schedulerService.deleteSchedules('foo/bar');
    expect(await schedulerService.listSchedules('foo/bar')).toMatchObject([]);
    await schedulerService.addLockSchedules('foo/bar', 1);
    expect(await schedulerService.listSchedules('foo/bar')).toMatchObject([
      {
        Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/foo--bar-unlock',
        GroupName: 'default',
        Name: 'foo--bar-unlock',
        State: 'ENABLED',
        Target: {
          Arn: 'arn:aws:lambda:undefined:undefined:function:railcross-dev-unlocker',
        },
        FlexibleTimeWindow: { Mode: 'OFF' },
        ScheduleExpression: 'cron(0 8 ? * * *)',
        ScheduleExpressionTimezone: 'UTC',
      },
      {
        Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/foo--bar-lock',
        GroupName: 'default',
        Name: 'foo--bar-lock',
        State: 'ENABLED',
        Target: {
          Arn: 'arn:aws:lambda:undefined:undefined:function:railcross-dev-locker',
        },
        FlexibleTimeWindow: { Mode: 'OFF' },
        ScheduleExpression: 'cron(0 16 ? * * *)',
        ScheduleExpressionTimezone: 'UTC',
      },
    ]);
    await schedulerService.updateSchedules('foo/bar', 22, 6, 'Europe/Helsinki');
    expect(await schedulerService.listSchedules('foo/bar')).toMatchObject([
      {
        Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/foo--bar-unlock',
        GroupName: 'default',
        Name: 'foo--bar-unlock',
        Target: {
          Arn: 'arn:aws:lambda:undefined:undefined:function:railcross-dev-unlocker',
        },
        FlexibleTimeWindow: { Mode: 'OFF' },
        ScheduleExpression: 'cron(0 6 ? * * *)',
        ScheduleExpressionTimezone: 'Europe/Helsinki',
      },
      {
        Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/foo--bar-lock',
        GroupName: 'default',
        Name: 'foo--bar-lock',
        Target: {
          Arn: 'arn:aws:lambda:undefined:undefined:function:railcross-dev-locker',
        },
        FlexibleTimeWindow: { Mode: 'OFF' },
        ScheduleExpression: 'cron(0 22 ? * * *)',
        ScheduleExpressionTimezone: 'Europe/Helsinki',
      },
    ]);
    await schedulerService.deleteSchedules('foo/bar');
    expect(await schedulerService.listSchedules('foo/bar')).toMatchObject([]);
  });
});
//# sourceMappingURL=scheduler.service.test.js.map
