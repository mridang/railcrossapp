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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const timezone_validator_1 = require("./timezone.validator");
const scheduler_service_1 = __importDefault(require("./scheduler.service"));
class ScheduleDto {
    lock_time;
    unlock_time;
    installation_id;
    timezone;
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(23),
    __metadata("design:type", Number)
], ScheduleDto.prototype, "lock_time", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(23),
    __metadata("design:type", Number)
], ScheduleDto.prototype, "unlock_time", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ScheduleDto.prototype, "installation_id", void 0);
__decorate([
    (0, timezone_validator_1.IsSupportedTimeZone)({ message: 'Timezone is not valid' }),
    __metadata("design:type", String)
], ScheduleDto.prototype, "timezone", void 0);
let SetupController = class SetupController {
    schedulerService;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
        //
    }
    showSetup() {
        return {
            timezones: Intl.supportedValuesOf('timeZone'),
        };
    }
    async updateSetup(scheduleDto) {
        if (scheduleDto.lock_time <= scheduleDto.unlock_time) {
            throw new common_1.BadRequestException('Lock time must be after unlock time.');
        }
        //await this.schedulerService.updateSchedules(scheduleDto.installation_id, scheduleDto.lock_time, scheduleDto.unlock_time, scheduleDto.timezone)
        return { message: 'Schedule created successfully', schedule: scheduleDto };
    }
};
exports.SetupController = SetupController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Render)('setup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SetupController.prototype, "showSetup", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScheduleDto]),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "updateSetup", null);
exports.SetupController = SetupController = __decorate([
    (0, common_1.Controller)('setup'),
    __metadata("design:paramtypes", [scheduler_service_1.default])
], SetupController);
//# sourceMappingURL=setup.controller.js.map