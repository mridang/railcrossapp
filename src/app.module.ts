import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule} from '@nestjs/config';
import {LockdownModule} from './services/lockdown/lockdown.module';

@Module({
    imports: [
        LockdownModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [
        //
    ],
})
export class AppModule {
    //
}
