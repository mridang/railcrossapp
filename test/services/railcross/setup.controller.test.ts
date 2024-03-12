import { expect } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { End2EndModule } from '../../e2e.module';
import { AppModule } from '../../../src/app.module';
import RailcrossService from '../../../src/services/railcross/railcross.service';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

const railcrossServiceMock = { updateSchedules: jest.fn() };

const testModule = new End2EndModule({
  imports: [
    {
      module: AppModule,
    },
  ],
});

describe('setup.controller test', () => {
  beforeEach(() => {
    railcrossServiceMock.updateSchedules.mockClear();
  });

  beforeAll(async () => {
    await testModule.beforeAll((testModule) =>
      testModule
        .overrideProvider(RailcrossService)
        .useValue(railcrossServiceMock),
    );
  });

  afterAll(async () => {
    await testModule.afterAll();
  });

  it('/POST setup should create schedule and invoke updateSchedules', async () => {
    const jwtService = testModule.app.get(JwtService);
    const scheduleDto = {
      lock_time: 22,
      unlock_time: 2,
      installation_id: 1,
      timezone: 'Asia/Bangkok',
    };
    railcrossServiceMock.updateSchedules.mockResolvedValue(null); // Assuming updateSchedules doesn't return anything

    await request(testModule.app.getHttpServer())
      .post('/app/setup')
      .set(
        'Cookie',
        `jwt=${jwtService.sign(
          {
            installationIds: [1, 2],
            accessToken: 'token',
          },
          {
            subject: 'mridang',
            issuer: 'jest',
            audience: ['mridang/testing'],
          },
        )}`,
      )
      .send(scheduleDto)
      .expect(HttpStatus.CREATED);

    expect(railcrossServiceMock.updateSchedules).toHaveBeenCalledTimes(1);
    expect(railcrossServiceMock.updateSchedules).toHaveBeenCalledWith(
      scheduleDto.installation_id,
      scheduleDto.lock_time,
      scheduleDto.unlock_time,
      scheduleDto.timezone,
    );
  });

  it('/POST setup with invalid body should return bad request and not invoke updateSchedules', async () => {
    const jwtService = testModule.app.get(JwtService);
    const scheduleDto = {
      lock_time: 2, // Invalid because lock_time <= unlock_time
      unlock_time: 22,
      installation_id: 1,
      timezone: 'UTC',
    };

    await request(testModule.app.getHttpServer())
      .post('/app/setup')
      .set(
        'Cookie',
        `jwt=${jwtService.sign(
          {
            installationIds: [1, 2],
            accessToken: 'token',
          },
          {
            subject: 'mridang',
            issuer: 'jest',
            audience: ['mridang/testing'],
          },
        )}`,
      )
      .send(scheduleDto)
      .expect(HttpStatus.BAD_REQUEST);

    expect(railcrossServiceMock.updateSchedules).not.toHaveBeenCalled();
  });
});
