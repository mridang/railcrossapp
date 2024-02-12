import { createProbot } from 'probot';
import { getSecret } from './utils';
import { APIGatewayProxyHandler } from 'aws-lambda';
import lowercaseKeys from 'lowercase-keys';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';
import app from './probot';
import { secretName } from './constants';

export const handler: APIGatewayProxyHandler = async (event) => {
  const secret = await getSecret(secretName);

  const probot = createProbot({
    overrides: {
      appId: secret.APP_ID,
      privateKey: secret.PRIVATE_KEY.replaceAll('&', '\n'),
      secret: secret.WEBHOOK_SECRET,
    },
  });
  await probot.load(app);

  const headers = lowercaseKeys(event.headers);

  const id = headers['x-github-delivery'];
  if (id !== undefined) {
    const name = headers['x-github-event'];
    if (name !== undefined) {
      const signature =
        headers['x-hub-signature-256'] || headers['x-hub-signature'];
      if (signature !== undefined) {
        const payload = event.body;
        if (payload !== null) {
          await probot.webhooks.verifyAndReceive({
            id,
            signature,
            payload,
            name: name as EmitterWebhookEventName,
          });

          return {
            statusCode: 200,
            body: JSON.stringify({ ok: true }),
          };
        } else {
          return {
            statusCode: 400,
            body: 'Missing webhook request body',
          };
        }
      } else {
        return {
          statusCode: 400,
          body: 'Missing x-github-signature header',
        };
      }
    } else {
      return {
        statusCode: 400,
        body: 'Missing x-github-event header',
      };
    }
  } else {
    return {
      statusCode: 400,
      body: 'Missing x-github-delivery header',
    };
  }
};
