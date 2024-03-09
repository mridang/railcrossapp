import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Catch(HttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomHttpExceptionFilter.name);
  private readonly basePath: string;

  constructor() {
    this.logger.log(
      `Looking for error pages ${path.join(__dirname, '..', 'views', 'errors')}`,
    );
    if (
      fs.existsSync(path.join(__dirname, '..', 'views', 'errors', `500.html`))
    ) {
      this.basePath = path.join(__dirname, '..', 'views', 'errors');
    } else {
      this.logger.log(
        `Looking for error pages ${path.join(__dirname, 'views', 'errors')}`,
      );
      if (fs.existsSync(path.join(__dirname, 'views', 'errors', `500.html`))) {
        this.basePath = path.join(__dirname, 'views', 'errors');
      } else {
        throw new Error('Unable to find directory containing error pages');
      }
    }
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const acceptHeader = ctx.getRequest().headers.accept;

    if (acceptHeader.includes('text/html')) {
      const filePath = path.join(this.basePath, `${status}.html`);
      if (fs.existsSync(filePath)) {
        response.status(status).sendFile(filePath);
      } else {
        throw new Error(
          `Error page not found for status code: ${status}, serving JSON error response instead.`,
        );
      }
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      });
    }
  }
}
