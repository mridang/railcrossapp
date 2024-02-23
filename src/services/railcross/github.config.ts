import {
  GetSecretValueCommand,
  GetSecretValueResponse,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class GithubConfig {
  private static readonly decoder = new TextDecoder('utf8');
  private readonly client = new SecretsManagerClient();

  async getSecret(
      secretName: string,
  ): Promise<{ appId: string; privateKey: string; secret: string }> {
    const command: GetSecretValueCommand = new GetSecretValueCommand({
      SecretId: secretName,
    });

    const data: GetSecretValueResponse = (await this.client.send(
        command,
    )) as GetSecretValueResponse;
    // Secrets Manager stores the secret data as a string in either `SecretString` or `SecretBinary`
    if (data.SecretString) {
      const { APP_ID, PRIVATE_KEY, WEBHOOK_SECRET } = JSON.parse(
          data.SecretString,
      );
      return {
        appId: APP_ID,
        privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
        secret: WEBHOOK_SECRET,
      };
    } else {
      if (data.SecretBinary) {
        // If the secret is binary, you might need to decode it
        const buff = GithubConfig.decoder.decode(data.SecretBinary);
        const { APP_ID, PRIVATE_KEY, WEBHOOK_SECRET } = JSON.parse(
            buff.toString(),
        );
        return {
          appId: APP_ID,
          privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
          secret: WEBHOOK_SECRET,
        };
      } else {
        throw new Error();
      }
    }
  }
}
