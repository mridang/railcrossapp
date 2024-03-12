import { expect } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { AuthMiddleware } from '../../../src/services/github/auth.middleware';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('auth.middleware tests', () => {
  const jwtService = new JwtService({ secret: 'test' });
  const clientId = 'mcid';
  const redirectUri = 'http://localhost/callback';
  const middleware = new AuthMiddleware(jwtService, clientId, redirectUri);

  it('should redirect if no JWT cookie found', () => {
    const nextFunction: NextFunction = jest.fn();
    const mockResponse: Partial<Response> = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(), // For chaining .send()
      send: jest.fn(),
    };
    const mockRequest: Partial<Request> = {
      //
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=randomStringToPreventCSRF`,
    );
  });

  it('should call next if valid JWT token is provided', () => {
    const nextFunction: NextFunction = jest.fn();
    const mockResponse: Partial<Response> = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(), // For chaining .send()
      send: jest.fn(),
    };
    const mockRequest: Partial<Request> = {
      cookies: { jwt: jwtService.sign({ id: 'user123' }) },
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if invalid JWT token is provided', () => {
    const nextFunction: NextFunction = jest.fn();
    const mockResponse: Partial<Response> = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(), // For chaining .send()
      send: jest.fn(),
    };
    const mockRequest: Partial<Request> = {
      cookies: { jwt: 'invalidToken' },
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Invalid token.',
    });
  });
});
