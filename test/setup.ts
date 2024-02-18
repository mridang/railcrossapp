/* eslint-disable no-console */
import path from 'path';
import { DockerComposeEnvironment } from 'testcontainers';

declare global {
    // eslint-disable-next-line no-var
    var DOCKER: any;
}

// this allows test containers to work in build pipeline
process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

export default async function setup(): Promise<void> {
    console.info('Starting docker compose');
    const composeFilePath = path.resolve(__dirname, '..');
    try {
        globalThis.DOCKER = await new DockerComposeEnvironment(
            composeFilePath,
            'docker-compose.yml'
        ).up();
    } catch (err: any) {
        if (err.message.includes('already in use')) {
            console.info('Docker compose already running. Skipping bootstrap');
            return;
        }
        throw err;
    }
}
