import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { HttpService } from '@nestjs/axios';
import Repository from './types';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {
    //
  }

  async listReposWithInstallations(
    accessToken: string,
  ): Promise<{ installationId: number; ownerRepo: Repository }[]> {
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

    const installations = await this.listInstallations(octokit);
    const reposWithInstallations = await Promise.all(
      installations.map(async (installation) => {
        const repositories = await this.listInstallationRepos(
          octokit,
          installation,
        );
        return repositories.map((repository) => ({
          ownerRepo: new Repository(repository),
          installationId: installation,
        }));
      }),
    );

    return reposWithInstallations.flat();
  }

  private async listInstallations(octokit: Octokit): Promise<number[]> {
    const data = await octokit.paginate(
      octokit.apps.listInstallationsForAuthenticatedUser,
      {
        per_page: 100,
      },
    );

    return data.map((installation) => installation.id);
  }

  private async listInstallationRepos(
    octokit: Octokit,
    installationId: number,
  ): Promise<string[]> {
    const data = await octokit.paginate(
      octokit.apps.listInstallationReposForAuthenticatedUser,
      {
        per_page: 100,
        installation_id: installationId,
      },
    );
    // @ts-expect-error sss
    return data.map((repository) => repository.full_name);
  }
}
