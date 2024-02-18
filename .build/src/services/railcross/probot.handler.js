"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RailcrossProbot_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protection_service_1 = __importDefault(require("./protection.service"));
const scheduler_service_1 = __importDefault(require("./scheduler.service"));
const common_1 = require("@nestjs/common");
let RailcrossProbot = RailcrossProbot_1 = class RailcrossProbot {
    railcrossService;
    schedulerService;
    constructor(railcrossService, schedulerService) {
        this.railcrossService = railcrossService;
        this.schedulerService = schedulerService;
        //
    }
    init() {
        const railcrossService = this.railcrossService;
        const schedulerService = this.schedulerService;
        return (app) => {
            const logger = new common_1.Logger(RailcrossProbot_1.name);
            app.on('installation.created', async (context) => {
                const { id, account } = context.payload.installation;
                logger.log(`New app installation for @${account.login}`);
                for (const repo of context.payload?.repositories || []) {
                    logger.log(`Configuring schedules and rules for ${repo.full_name}`);
                    await schedulerService.addLockSchedules(repo.full_name, id);
                    await railcrossService.toggleProtection(repo.full_name, id, true);
                }
            });
            app.on('installation_repositories.added', async (context) => {
                const { id, account } = context.payload.installation;
                logger.log(`Some repositories added on @${account.login}`);
                for (const repo of context.payload?.repositories_added || []) {
                    logger.log(`Adding schedules and rules for ${repo.full_name}`);
                    await schedulerService.addLockSchedules(repo.full_name, id);
                    await railcrossService.toggleProtection(repo.full_name, id, true);
                }
            });
            app.on('installation_repositories.removed', async (context) => {
                const { account } = context.payload.installation;
                logger.log(`Some repositories removed on @${account.login}`);
                for (const repo of context.payload?.repositories_removed || []) {
                    logger.log(`Removing schedules and rules for ${repo.full_name}`);
                    await schedulerService.deleteSchedules(repo.full_name);
                }
            });
            app.on('installation.deleted', async (context) => {
                const { account } = context.payload.installation;
                logger.log(`Some repositories removed on @${account.login}`);
                for (const repo of context.payload?.repositories || []) {
                    logger.log(`Uninstalling schedules and rules for ${repo.full_name}`);
                    await schedulerService.deleteSchedules(repo.full_name);
                }
            });
        };
    }
};
RailcrossProbot = RailcrossProbot_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [protection_service_1.default,
        scheduler_service_1.default])
], RailcrossProbot);
exports.default = RailcrossProbot;
//# sourceMappingURL=probot.handler.js.map