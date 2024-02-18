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
var ProtectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
let ProtectionService = ProtectionService_1 = class ProtectionService {
    octokitFn;
    logger = new common_1.Logger(ProtectionService_1.name);
    constructor(octokitFn) {
        this.octokitFn = octokitFn;
        //
    }
    async toggleProtection(repositoryName, installationId, lockState) {
        const owner = repositoryName.split('/')[0];
        const repo = repositoryName.split('/')[1];
        const octokit = this.octokitFn(installationId);
        const { data: repository } = await octokit.repos.get({
            owner: owner,
            repo: repo,
        });
        this.logger.log(`Updating branch-protection for ${repositoryName}`);
        try {
            const { data: { allow_deletions, allow_force_pushes, block_creations, enforce_admins, required_conversation_resolution, required_linear_history, required_pull_request_reviews, required_status_checks, restrictions, }, } = await octokit.repos.getBranchProtection({
                owner,
                repo: repository.name,
                branch: repository.default_branch,
            });
            this.logger.log(`The ${repository.default_branch} is currently protected`);
            await octokit.repos.updateBranchProtection({
                allow_deletions: allow_deletions?.enabled,
                allow_force_pushes: allow_force_pushes?.enabled,
                block_creations: block_creations?.enabled,
                enforce_admins: enforce_admins?.enabled || null,
                required_conversation_resolution: required_conversation_resolution?.enabled,
                required_linear_history: required_linear_history?.enabled,
                required_pull_request_reviews: {
                    dismissal_restrictions: required_pull_request_reviews?.dismissal_restrictions
                        ? {
                            users: required_pull_request_reviews?.dismissal_restrictions?.users?.map((user) => user.name) || [],
                            teams: required_pull_request_reviews?.dismissal_restrictions?.teams?.map((team) => team.name) || [],
                            apps: required_pull_request_reviews?.dismissal_restrictions?.apps?.map((app) => app.name) || [],
                        }
                        : undefined,
                    dismiss_stale_reviews: required_pull_request_reviews?.dismiss_stale_reviews,
                    require_code_owner_reviews: required_pull_request_reviews?.require_code_owner_reviews,
                    required_approving_review_count: required_pull_request_reviews?.required_approving_review_count,
                    bypass_pull_request_allowances: required_pull_request_reviews?.bypass_pull_request_allowances
                        ? {
                            users: required_pull_request_reviews?.bypass_pull_request_allowances?.users?.map((user) => user.name) || [],
                            teams: required_pull_request_reviews?.bypass_pull_request_allowances?.teams?.map((team) => team.name) || [],
                            apps: required_pull_request_reviews?.bypass_pull_request_allowances?.apps?.map((app) => app.name) || [],
                        }
                        : undefined,
                },
                required_status_checks: required_status_checks
                    ? {
                        strict: required_status_checks?.strict || false,
                        contexts: required_status_checks?.contexts || [],
                        checks: [],
                    }
                    : null,
                restrictions: restrictions
                    ? {
                        users: restrictions?.users.map((u) => u.login) || [],
                        teams: restrictions?.teams.map((u) => u.name) || [],
                        apps: restrictions?.apps.map((u) => u.name) || [],
                    }
                    : null,
                owner: owner,
                repo: repository.name,
                branch: repository.default_branch,
                lock_branch: lockState,
            });
        }
        catch (error) {
            this.logger.log(`The ${repository.default_branch} isn't protected.`);
            await octokit.repos.updateBranchProtection({
                enforce_admins: null,
                required_pull_request_reviews: null,
                required_status_checks: null,
                restrictions: null,
                owner: owner,
                repo: repository.name,
                branch: repository.default_branch,
                lock_branch: lockState,
            });
        }
        this.logger.log(`The ${repository.default_branch} has been locked.`);
        return (await octokit.repos.getBranchProtection({
            owner,
            repo: repository.name,
            branch: repository.default_branch,
        })).data;
    }
};
ProtectionService = ProtectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('GITHUB_FN')),
    __metadata("design:paramtypes", [Function])
], ProtectionService);
exports.default = ProtectionService;
//# sourceMappingURL=protection.service.js.map