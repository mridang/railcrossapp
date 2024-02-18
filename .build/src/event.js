"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protection_service_1 = __importDefault(require("./services/railcross/protection.service"));
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
exports.lock = async ({ installation_id, repo_name, }) => {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const protectionService = app.get(protection_service_1.default);
    await protectionService.toggleProtection(repo_name, installation_id, true);
};
exports.unlock = async ({ installation_id, repo_name, }) => {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const protectionService = app.get(protection_service_1.default);
    await protectionService.toggleProtection(repo_name, installation_id, false);
};
//# sourceMappingURL=event.js.map