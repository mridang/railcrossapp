import { HttpStatus, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

export class AuthMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly clientId: string,
    private readonly redirectUri: string,
  ) {
    //
  }

  use(request: Request, response: Response, next: NextFunction) {
    const token = request.cookies ? request.cookies['jwt'] : undefined;
    if (!token) {
      const state = 'randomStringToPreventCSRF';
      const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${state}`;
      this.logger.log(`No JWT cookie found. Redirecting to ${githubOAuthUrl}`);
      return response.redirect(githubOAuthUrl);
    } else {
      try {
        // @ts-expect-error since this added dynamically
        request.user = this.jwtService.verify(token);
        next();
      } catch (error) {
        this.logger.error(`Tampered JWT with value ${token} found`);
        return response
          .status(HttpStatus.UNAUTHORIZED)
          .send({ message: 'Invalid token.' });
      }
    }
  }
}
