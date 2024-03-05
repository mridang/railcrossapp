import {
  GetSecretValueCommand,
  GetSecretValueResponse,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

@Injectable()
export default class GithubConfig {
  private readonly logger = new Logger(GithubConfig.name);
  private static readonly decoder = new TextDecoder('utf8');

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

      const command: GetSecretValueCommand = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const data: GetSecretValueResponse = (await this.client.send(
        command,
      )) as GetSecretValueResponse;
      if (data.SecretString) {
        const {
          APP_ID,
          CLIENT_ID,
          CLIENT_SECRET,
          PRIVATE_KEY,
          WEBHOOK_SECRET,
        } = JSON.parse(data.SecretString);
        return {
          appId: APP_ID,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
          secret: WEBHOOK_SECRET,
        };
      } else {
        if (data.SecretBinary) {
          const buff = GithubConfig.decoder.decode(data.SecretBinary);
          const {
            APP_ID,
            CLIENT_ID,
            CLIENT_SECRET,
            PRIVATE_KEY,
            WEBHOOK_SECRET,
          } = JSON.parse(buff.toString());
          return {
            appId: APP_ID,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
            secret: WEBHOOK_SECRET,
          };
        } else {
          throw new Error();
        }
      }
    }
  }
}
