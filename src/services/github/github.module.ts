import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import GithubConfig from './github.config';
import { secretName } from '../../constants';
import { createAppAuth } from '@octokit/auth-app';
import { retry } from '@octokit/plugin-retry';
import { AuthMiddleware } from './auth.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

const MyOctokit = Octokit.plugin(retry);

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GithubConfig,
    {
      inject: [GithubConfig],
      provide: 'GITHUB_FN',
      useFactory: async (githubConfig: GithubConfig) => {
        const secret = await githubConfig.getSecret(secretName);

        return (installationId: number) => {
          return new MyOctokit({
            authStrategy: createAppAuth,
            auth: {
              appId: secret.appId,
              privateKey: secret.privateKey,
              installationId: installationId,
            },
            retry: {
              doNotRetry: [400, 401, 403, 404, 422, 429, 451],
            },
          });
        };
      },
    },
    AuthGuard,
  ],
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        const githubConfig = new GithubConfig();
        const appConfig = await githubConfig.getSecret(secretName);
        return {
          secret: appConfig.secret,
          signOptions: { expiresIn: '60m' },
        };
      },
    }),
  ],
  exports: [AuthGuard, JwtModule, GithubConfig, AuthService],
})
export class GithubModule implements NestModule {
  constructor(
    private readonly githubConfig: GithubConfig,
    private readonly jwtService: JwtService,
  ) {
    //
  }

  async configure(consumer: MiddlewareConsumer) {
    const appSecrets = await this.githubConfig.getSecret(secretName);
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const middlewareInstance = new AuthMiddleware(
          this.jwtService,
          appSecrets.clientId,
          'https://marhsall.loca.lt/auth',
        );
        middlewareInstance.use(req, res, next);
      })
      .forRoutes('app');
  }
}
