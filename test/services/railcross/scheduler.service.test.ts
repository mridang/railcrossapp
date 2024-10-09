import { expect } from '@jest/globals';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import SchedulerService from '../../../src/services/railcross/scheduler.service';

describe('scheduler.service test', () => {
  test('that deleting non-existant schedules is okay', async () => {
    const schedulerService = new SchedulerService(
      new SchedulerClient(),
      'default',
    );

    expect(await schedulerService.deleteSchedules(9, 9)).toBeUndefined();
  });

  test('that fetching non-existant schedules is okay', async () => {
    const schedulerService = new SchedulerService(
      new SchedulerClient(),
      'default',
    );

    expect(await schedulerService.getSchedule(0, 1, 'fn')).toEqual(null);
  });

  test('that schedules are created and deleted correctly"', async () => {
    const schedulerService = new SchedulerService(
      new SchedulerClient(),
      'default',
    );

    expect(await schedulerService.getSchedule(0, 1, 'fn')).toEqual(null);
    await schedulerService.createSchedule(
      0,
      1,
      'github/octocat',
      8,
      'UTC',
      'fn',
    );
    expect(await schedulerService.getSchedule(0, 1, 'fn')).toMatchObject({
      Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/0.1.fn',
      GroupName: 'default',
      Name: '0.1.fn',
      Target: {
        Arn: 'arn:aws:lambda:us-east-1:188628773952:function:railcross-test-fn',
        Input: '{"repo_name":"github/octocat","installation_id":0}',
      },
      FlexibleTimeWindow: { Mode: 'OFF' },
      ScheduleExpression: 'cron(0 8 ? * * *)',
      ScheduleExpressionTimezone: 'UTC',
    });

    await schedulerService.deleteSchedules(0, 0);
    expect(await schedulerService.getSchedule(0, 1, 'fn')).toMatchObject({
      Arn: 'arn:aws:scheduler:us-east-1:000000000000:schedule/default/0.1.fn',
      GroupName: 'default',
      Name: '0.1.fn',
      Target: {
        Arn: 'arn:aws:lambda:us-east-1:188628773952:function:railcross-test-fn',
        Input: '{"repo_name":"github/octocat","installation_id":0}',
      },
      FlexibleTimeWindow: { Mode: 'OFF' },
      ScheduleExpression: 'cron(0 8 ? * * *)',
      ScheduleExpressionTimezone: 'UTC',
    });

    await schedulerService.deleteSchedules(0, 1);
    expect(await schedulerService.getSchedule(0, 1, 'fn')).toEqual(null);
  });
});
