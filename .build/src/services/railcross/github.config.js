"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GithubConfig_1;
Object.defineProperty(exports, "__esModule", { value: true });
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const common_1 = require("@nestjs/common");
let GithubConfig = class GithubConfig {
    static { GithubConfig_1 = this; }
    client = new client_secrets_manager_1.SecretsManagerClient();
    static decoder = new TextDecoder('utf8');
    async getSecret(secretName) {
        const command = new client_secrets_manager_1.GetSecretValueCommand({
            SecretId: secretName,
        });
        try {
            const data = (await this.client.send(command));
            // Secrets Manager stores the secret data as a string in either `SecretString` or `SecretBinary`
            if (data.SecretString) {
                const { APP_ID, PRIVATE_KEY, WEBHOOK_SECRET } = JSON.parse(data.SecretString);
                return {
                    appId: APP_ID,
                    privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
                    secret: WEBHOOK_SECRET,
                };
            }
            else {
                if (data.SecretBinary) {
                    // If the secret is binary, you might need to decode it
                    const buff = GithubConfig_1.decoder.decode(data.SecretBinary);
                    const { APP_ID, PRIVATE_KEY, WEBHOOK_SECRET } = JSON.parse(buff.toString());
                    return {
                        appId: APP_ID,
                        privateKey: PRIVATE_KEY.replaceAll('&', '\n'),
                        secret: WEBHOOK_SECRET,
                    };
                }
                else {
                    throw new Error();
                }
            }
        }
        catch (error) {
            console.error('Error fetching secret:', error);
            throw error;
        }
    }
};
GithubConfig = GithubConfig_1 = __decorate([
    (0, common_1.Injectable)()
], GithubConfig);
exports.default = GithubConfig;
//# sourceMappingURL=github.config.js.map