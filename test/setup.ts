/* eslint-disable no-console */
import path from 'path';
import { DockerComposeEnvironment } from 'testcontainers';
import { config } from 'dotenv';

declare global {
  // eslint-disable-next-line
  var DOCKER: any;
}

config();
// this allows test containers to work in build pipeline
process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

// noinspection JSUnusedGlobalSymbols
export default async function setup(): Promise<void> {
  console.info('Starting docker compose');
  const composeFilePath = path.resolve(__dirname, '..');
  try {
    globalThis.DOCKER = await new DockerComposeEnvironment(
      composeFilePath,
      'docker-compose.yml',
    ).up();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('already in use')) {
      console.info('Docker compose already running. Skipping bootstrap');
      return;
    }
    throw err;
  }
}
