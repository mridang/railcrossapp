import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { Response } from 'express';
import GithubConfig from './github.config';
import { secretName } from '../../constants';
import packageJson from '../../../package.json';
import { IsString, Length } from 'class-validator';
import murmurhash from 'murmurhash';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { ensure } from '../../utils/ensure';

class CallbackDto {
  @IsString()
  @Length(20)
  code?: string;

  @IsString()
  @Length(20)
  state?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly githubConfig: GithubConfig,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    //
  }

  @Get('/')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleGitHubCallback(
    @Res() response: Response,
    @Query() dto: CallbackDto,
  ) {
    const appSecret = await this.githubConfig.getSecret(secretName);
    const accessToken = await this.exchangeCodeForAccessToken(
      appSecret,
      ensure(dto.code),
    );

    const octokit = new Octokit({
      auth: accessToken,
      request:
        process.env.NODE_ENV === 'test'
          ? {
              fetch: buildAxiosFetch(this.httpService.axiosRef),
            }
          : {
              //
            },
    });
    const currentUser = await octokit.rest.users.getAuthenticated();
    const repoList = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        per_page: 100,
      },
    );
    const installationItems = await octokit.paginate(
      octokit.apps.listInstallationsForAuthenticatedUser,
      {
        per_page: 100,
      },
    );

    const sessionToken = this.jwtService.sign(
      {
        accessToken,
        installationIds: installationItems.map(
          (installationItem) => installationItem.id,
        ),
      },
      {
        subject: currentUser.data.login,
        issuer: packageJson.name,
        audience: repoList
          .filter((repo) => !repo.archived)
          .map((repo) => repo.full_name)
          .map((name) => `${murmurhash.v3(name)}`),
      },
    );

    response.cookie('jwt', sessionToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    response.redirect('/');
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
    });

    res.redirect('/');
  }

  private async exchangeCodeForAccessToken(
    appSecret: {
      clientSecret: string;
      clientId: string;
      appId: string;
      privateKey: string;
      secret: string;
    },
    code: string,
  ): Promise<string> {
    const tokenResponse = await lastValueFrom(
      this.httpService.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: appSecret.clientId,
          client_secret: appSecret.clientSecret,
          code: code,
        },
        {
          headers: { Accept: 'application/json' },
        },
      ),
    );

    if (!tokenResponse.data.access_token) {
      throw new Error('Failed to obtain access token.');
    }

    return tokenResponse.data.access_token;
  }
}
