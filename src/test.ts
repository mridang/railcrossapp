import { APIGatewayProxyHandler } from 'aws-lambda';
import { getSecret } from './utils';
import { createProbot } from 'probot';
import app from './probot';
import {
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { roleName, scheduleGroup } from './constants';

const scheduler = new SchedulerClient();

const command = new CreateScheduleCommand({
  Name: 'newScheduler',
  GroupName: scheduleGroup,
  ScheduleExpression: `cron(0 8 ? * * *)`,
  FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
  Target: {
    Arn: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:function:lockdown-dev-unlocker`,
    RoleArn: `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${roleName}`,
    Input: JSON.stringify({
      endDate: 'bar',
    }),
  },
});

scheduler.send(command);
