import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsSupportedTimeZone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedTimeZone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const timeZones = Intl.supportedValuesOf('timeZone');
          return timeZones.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid timezone`;
        },
      },
    });
  };
}
