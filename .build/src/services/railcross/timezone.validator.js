"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSupportedTimeZone = void 0;
const class_validator_1 = require("class-validator");
function IsSupportedTimeZone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'IsSupportedTimeZone',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    const timeZones = Intl.supportedValuesOf('timeZone');
                    return timeZones.includes(value);
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid timezone`;
                },
            },
        });
    };
}
exports.IsSupportedTimeZone = IsSupportedTimeZone;
//# sourceMappingURL=timezone.validator.js.map