import { expect } from '@jest/globals';
import { AuthGuard } from '../../../src/services/github/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import murmurhash from 'murmurhash';

describe('auth.guard tests', () => {
  const jwtService = new JwtService({ secret: 'test' });
  const authGuard = new AuthGuard(jwtService);

  it('should disallow access when no cookies are present', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access when the cookie is not present', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: { foo: 'bar' },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access with a malformed JWT token', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: { jwt: 'jwt' },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access with a valid JWT token but missing aud', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: { jwt: jwtService.sign({}) },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access with a valid JWT token but incorrect aud', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: {
            jwt: jwtService.sign(
              {},
              {
                audience: 'foobar',
              },
            ),
          },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access with a valid JWT token but incorrect aud', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: {
            jwt: jwtService.sign(
              {},
              {
                audience: ['foo/bar'],
              },
            ),
          },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should disallow access with a valid JWT token and incorrect aud', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: {
            jwt: jwtService.sign(
              {},
              {
                audience: ['foo/bar', 'testOrg/testRepo'],
              },
            ),
          },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(false);
  });

  it('should sallow access with a valid JWT token and correct aud', () => {
    const fakeContext: ExecutionContext = {
      switchToHttp: () => ({
        // @ts-expect-error since
        getRequest: () => ({
          cookies: {
            jwt: jwtService.sign(
              {},
              {
                audience: [
                  `${murmurhash.v3('foo/bar')}`,
                  `${murmurhash.v3('testOrg/testRepo')}`,
                ],
              },
            ),
          },
          params: {
            orgName: 'testOrg',
            repoName: 'testRepo',
          },
        }),
      }),
    };

    expect(authGuard.canActivate(fakeContext)).toBe(true);
  });
});
