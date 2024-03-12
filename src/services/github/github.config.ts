import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import getSecret from '../../utils/secrets';

@Injectable()
export default class GithubConfig {
  private readonly logger = new Logger(GithubConfig.name);

  constructor(
    @Inject('ENV_PATH')
    private readonly envPath: string = path.resolve(process.cwd(), '.env'),
    @Inject('SECRETS_MANAGER_CLIENT')
    private readonly client: SecretsManagerClient = new SecretsManagerClient(),
  ) {
    //
  }

  async getSecret(secretName: string): Promise<{
    clientId: string;
    clientSecret: string;
    appId: string;
    privateKey: string;
    secret: string;
  }> {
    if (fs.existsSync(this.envPath)) {
      this.logger.log(`Reading configuration from file at ${this.envPath}`);
      dotenv.config({ path: this.envPath, override: true });

      return {
        appId: process.env.APP_ID as string,
        clientId: process.env.CLIENT_ID as string,
        clientSecret: process.env.CLIENT_SECRET as string,
        privateKey: process.env.PRIVATE_KEY?.replaceAll('&', '\n') as string,
        secret: process.env.WEBHOOK_SECRET as string,
      };
    } else {
      this.logger.log(`Reading configuration from secrets manager.`);
      const { APP_ID, CLIENT_ID, CLIENT_SECRET, PRIVATE_KEY, WEBHOOK_SECRET } =
        JSON.parse(await getSecret(secretName, this.client));
      return {
        appId: APP_ID,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
        secret: WEBHOOK_SECRET,
      };
    }
  }
}
