import { Global, Module } from '@nestjs/common';
import { secretName } from './constants';
import { RailcrossModule } from './services/railcross/railcross.module';
import { GithubModule } from './services/github/github.module';
import { DefaultsModule } from '@mridang/nestjs-defaults';

@Global()
@Module({
  imports: [
    DefaultsModule.register({
      configName: secretName,
    }),
    GithubModule,
    RailcrossModule,
  ],
  controllers: [
    //
  ],
  providers: [
    //
  ],
  exports: [
    //
  ],
})
export class AppModule {
  //
}
