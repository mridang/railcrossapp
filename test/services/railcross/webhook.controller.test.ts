import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { End2EndModule } from '../../e2e.module';
import { AppModule } from '../../../src/app.module';
import { createHmac } from 'node:crypto';
import GithubConfig from '../../../src/services/railcross/github.config';
import { secretName } from '../../../src/constants';

const testModule = new End2EndModule({
  imports: [
    {
      module: AppModule,
      providers: [],
    },
  ],
});

describe('webhook.controller test', () => {
  beforeAll(async () => {
    await testModule.beforeAll();
  });

  afterAll(async () => {
    await testModule.afterAll();
  });

  it('/hook (POST)', async () => {
    const webhookSecret = await testModule.app
      .get(GithubConfig)
      .getSecret(secretName);

    const payload = {
      action: 'opened',
      issue: {
        number: 1,
      },
      repository: {
        id: 123,
        name: 'Hello-World',
        full_name: 'octocat/Hello-World',
      },
      sender: {
        login: 'octocat',
      },
    };
    const signature = createHmac('sha256', webhookSecret.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return request(testModule.app.getHttpServer())
      .post('/hook')
      .set({
        'x-github-delivery': '72d3162e-cc78-11e3-81ab-4c9367dc0958',
        'x-github-event': 'installation',
        'x-hub-signature-256': `sha256=${signature}`,
        'Content-Type': 'application/json',
      })
      .send(JSON.stringify(payload))
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toEqual({
          //
        });
      });
  });

  it('should return 400 without x-github-delivery header', async () => {
    const webhookSecret = await testModule.app
      .get(GithubConfig)
      .getSecret(secretName);
    const payload = {
      action: 'opened',
      issue: { number: 1 },
      repository: {
        id: 123,
        name: 'Hello-World',
        full_name: 'octocat/Hello-World',
      },
      sender: { login: 'octocat' },
    };
    const signature = createHmac('sha256', webhookSecret.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return request(testModule.app.getHttpServer())
      .post('/hook')
      .set({
        'x-github-event': 'installation',
        'x-hub-signature-256': `sha256=${signature}`,
        'Content-Type': 'application/json',
      })
      .send(JSON.stringify(payload))
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return 400 without x-github-event header', async () => {
    const webhookSecret = await testModule.app
      .get(GithubConfig)
      .getSecret(secretName);
    const payload = {
      action: 'opened',
      issue: { number: 1 },
      repository: {
        id: 123,
        name: 'Hello-World',
        full_name: 'octocat/Hello-World',
      },
      sender: { login: 'octocat' },
    };
    const signature = createHmac('sha256', webhookSecret.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return request(testModule.app.getHttpServer())
      .post('/hook')
      .set({
        'x-github-delivery': '72d3162e-cc78-11e3-81ab-4c9367dc0958',
        'x-hub-signature-256': `sha256=${signature}`,
        'Content-Type': 'application/json',
      })
      .send(JSON.stringify(payload))
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return 400 without x-hub-signature-256 header', async () => {
    const webhookSecret = await testModule.app
      .get(GithubConfig)
      .getSecret(secretName);
    const payload = {
      action: 'opened',
      issue: { number: 1 },
      repository: {
        id: 123,
        name: 'Hello-World',
        full_name: 'octocat/Hello-World',
      },
      sender: { login: 'octocat' },
    };
    const signature = createHmac('sha256', webhookSecret.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return request(testModule.app.getHttpServer())
      .post('/hook')
      .set({
        'x-github-delivery': '72d3162e-cc78-11e3-81ab-4c9367dc0958',
        'x-github-event': 'installation',
        'Content-Type': 'application/json',
        'x-hub-signature-512': `sha256=${signature}`,
      })
      .send(JSON.stringify(payload))
      .expect(HttpStatus.BAD_REQUEST);
  });
});
