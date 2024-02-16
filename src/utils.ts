import {GetSecretValueCommand, GetSecretValueResponse, SecretsManagerClient,} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient();
const decoder = new TextDecoder('utf8');

export async function getSecret(secretName: string) {
  const command: GetSecretValueCommand = new GetSecretValueCommand({
    SecretId: secretName,
  });

  try {
    const data: GetSecretValueResponse = (await client.send(
      command,
    )) as GetSecretValueResponse;
    // Secrets Manager stores the secret data as a string in either `SecretString` or `SecretBinary`
    if (data.SecretString) {
      return JSON.parse(data.SecretString);
    } else {
      if (data.SecretBinary) {
        // If the secret is binary, you might need to decode it
        const buff = decoder.decode(data.SecretBinary);
        return JSON.parse(buff.toString());
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw error;
  }
}
