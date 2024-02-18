import ProtectionService from './services/lockdown/protection.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

exports.lock = async ({
  installation_id,
  repo_name,
}: {
  repo_name: string;
  installation_id: number;
}) => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const protectionService = app.get(ProtectionService);
  await protectionService.toggleProtection(repo_name, installation_id, true);
};

exports.unlock = async ({
  installation_id,
  repo_name,
}: {
  repo_name: string;
  installation_id: number;
}) => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const protectionService = app.get(ProtectionService);
  await protectionService.toggleProtection(repo_name, installation_id, false);
};
