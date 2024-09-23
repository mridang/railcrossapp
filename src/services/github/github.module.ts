import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './authen/auth.module';
import { OctokitModule } from './octokit/octokit.module';

@Module({
  controllers: [
    //
  ],
  providers: [
    //
  ],
  imports: [
    OctokitModule,
    AuthModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          authConfig: {
            clientId: configService.getOrThrow('GITHUB_CLIENT_ID'),
            clientSecret: configService.getOrThrow('GITHUB_CLIENT_SECRET'),
          },
          authTTL: 60 * 60,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [
    //
  ],
})
export class GithubModule {
  //
}
