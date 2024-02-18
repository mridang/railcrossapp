"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const serverless_express_1 = __importDefault(require("@codegenie/serverless-express"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
const logger_1 = require("@aws-lambda-powertools/logger");
const express_handlebars_1 = __importDefault(require("express-handlebars"));
class PowertoolsLoggerService {
    logger;
    constructor() {
        this.logger = new logger_1.Logger();
    }
    formatMessage(message, context) {
        if (typeof message === 'string') {
            return context ? `${context}: ${message}` : message;
        }
        else {
            return JSON.stringify({ context, ...message });
        }
    }
    log(message, context) {
        this.logger.info(this.formatMessage(message, context));
    }
    error(message, trace, context) {
        this.logger.error(this.formatMessage(message, context), { trace });
    }
    warn(message, context) {
        this.logger.warn(this.formatMessage(message, context));
    }
    debug(message, context) {
        this.logger.debug(this.formatMessage(message, context));
    }
    verbose(message, context) {
        this.logger.debug(this.formatMessage(message, context));
    }
}
let cachedServer;
async function bootstrap() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        // @ts-expect-error since this cannot be empty
        expressApp.engine('handlebars', (0, express_handlebars_1.default)());
        expressApp.set('view engine', 'handlebars');
        expressApp.set('views', './src/views');
        const nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
            logger: new PowertoolsLoggerService(),
        });
        nestApp.enableCors();
        await nestApp.init();
        cachedServer = (0, serverless_express_1.default)({ app: expressApp });
    }
    return cachedServer;
}
const handler = async (event, context, callback) => {
    const server = await bootstrap();
    return server(event, context, callback);
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map