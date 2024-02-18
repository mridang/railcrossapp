'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookController = void 0;
const common_1 = require('@nestjs/common');
const probot_1 = require('probot');
let WebhookController = class WebhookController {
  probot;
  constructor(probot) {
    this.probot = probot;
    //
  }
  async handleWebhook(request) {
    const id = request.headers['x-github-delivery'];
    if (id !== null && id !== undefined) {
      const name = request.headers['x-github-event'];
      if (name !== null && name !== undefined) {
        const signature =
          request.headers['x-hub-signature-256'] ||
          request.headers['x-hub-signature'];
        if (signature !== null && signature !== undefined) {
          const payload = request.body;
          if (payload !== null) {
            await this.probot.webhooks.verifyAndReceive({
              id: Array.isArray(id) ? id.join('|') : id,
              signature: Array.isArray(signature)
                ? signature.join('|')
                : signature,
              payload,
              name: name,
            });
          } else {
            throw new common_1.BadRequestException(
              'Missing webhook request body',
            );
          }
        } else {
          throw new common_1.BadRequestException(
            'Missing x-github-signature header',
          );
        }
      } else {
        throw new common_1.BadRequestException('Missing x-github-event header');
      }
    } else {
      throw new common_1.BadRequestException(
        'Missing x-github-delivery header',
      );
    }
  }
};
exports.WebhookController = WebhookController;
__decorate(
  [
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  WebhookController.prototype,
  'handleWebhook',
  null,
);
exports.WebhookController = WebhookController = __decorate(
  [
    (0, common_1.Controller)('hook'),
    __param(0, (0, common_1.Inject)('PROBOT')),
    __metadata('design:paramtypes', [probot_1.Probot]),
  ],
  WebhookController,
);
//# sourceMappingURL=webhook.controller.js.map
