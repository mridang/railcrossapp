import { expect } from '@jest/globals';
import nock from 'nock';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../../../src/services/github/auth.service';

describe('auth.service tests', () => {
  beforeEach(() => {
    nock('https://api.github.com')
      .persist()
      .get('/user/installations?per_page=100')
      .reply(200, [{ id: 123 }, { id: 456 }])
      .get('/user/installations/123/repositories?per_page=100')
      .reply(
        200,
        {
          123: [{ full_name: 'foo/bar' }],
          456: [{ full_name: 'bar/zoo' }, { full_name: 'bar/bar' }],
        }[123],
      )
      .get('/user/installations/456/repositories?per_page=100')
      .reply(
        200,
        {
          123: [{ full_name: 'foo/bar' }],
          456: [{ full_name: 'bar/zoo' }, { full_name: 'bar/bar' }],
        }[456],
      );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('listReposWithInstallations should return formatted repos with installations', async () => {
    const authService = new AuthService(new HttpService());
    const result = await authService.listReposWithInstallations('token');
    expect(result).toEqual([
      {
        ownerRepo: {
          fullName: 'foo/bar',
          orgName: 'foo',
          repoName: 'bar',
        },
        installationId: 123,
      },
      {
        ownerRepo: {
          fullName: 'bar/zoo',
          orgName: 'bar',
          repoName: 'zoo',
        },
        installationId: 456,
      },
      {
        ownerRepo: {
          fullName: 'bar/bar',
          orgName: 'bar',
          repoName: 'bar',
        },
        installationId: 456,
      },
    ]);
  });
});
