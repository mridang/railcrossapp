import { APIGatewayProxyHandler } from 'aws-lambda';
import { getSecret } from './utils';
import { createProbot } from 'probot';
import app from './probot';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const secret = await getSecret('LockdownAppConfig');
  return {
    statusCode: 200,
    body: secret,
  };
};


getSecret('LockdownAppConfig')
    .then(dd => {
        console.log(dd.PRIVATE_KEY.replaceAll('&', '\n'))
    });

const probot = createProbot({
    overrides: {
        appId: "22444242",
        privateKey: "secret.PRIVATE_KEY",
        secret: "secret.WEBHOOK_SECRET"
    },
})
probot.load(app)
    .then(fff => {
        console.log(fff)
    })
