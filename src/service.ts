import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { Octokit } from '@octokit/rest';
import pino from 'pino';

export default class Service {
  private static readonly logger = pino({
    level: 'info',
  });

  async toggleProtection(
    installationId: number,
    octokit: RestEndpointMethods & Api & Octokit,
    lockState: boolean,
  ) {
    const {
      data: { repositories },
    } = await octokit.apps.listReposAccessibleToInstallation({
      installation_id: installationId,
      per_page: 100, // Adjust per_page up to a maximum of 100 if needed
    });

    for (const repository of repositories.filter(
      (repository) => !repository.archived,
    )) {
      const owner = repository.full_name.split('/')[0];
      Service.logger.info(
        `Updating branch-protection for ${repository.full_name}`,
      );

      try {
        const {
          data: {
            allow_deletions,
            allow_force_pushes,
            block_creations,
            enforce_admins,
            required_conversation_resolution,
            required_linear_history,
            required_pull_request_reviews,
            required_status_checks,
            restrictions,
          },
        } = await octokit.repos.getBranchProtection({
          owner,
          repo: repository.name,
          branch: repository.default_branch,
        });

        Service.logger.info(
          `The ${repository.default_branch} is currently protected`,
        );

        await octokit.repos.updateBranchProtection({
          allow_deletions: allow_deletions?.enabled,
          allow_force_pushes: allow_force_pushes?.enabled,
          block_creations: block_creations?.enabled,
          enforce_admins: enforce_admins?.enabled || null,
          required_conversation_resolution:
            required_conversation_resolution?.enabled,
          required_linear_history: required_linear_history?.enabled,
          required_pull_request_reviews: {
            dismissal_restrictions:
              required_pull_request_reviews?.dismissal_restrictions
                ? {
                    users:
                      required_pull_request_reviews?.dismissal_restrictions?.users?.map(
                        (user) => user.name as string,
                      ) || [],
                    teams:
                      required_pull_request_reviews?.dismissal_restrictions?.teams?.map(
                        (team) => team.name,
                      ) || [],
                    apps:
                      required_pull_request_reviews?.dismissal_restrictions?.apps?.map(
                        (app) => app.name,
                      ) || [],
                  }
                : undefined,
            dismiss_stale_reviews:
              required_pull_request_reviews?.dismiss_stale_reviews,
            require_code_owner_reviews:
              required_pull_request_reviews?.require_code_owner_reviews,
            required_approving_review_count:
              required_pull_request_reviews?.required_approving_review_count,
            bypass_pull_request_allowances:
              required_pull_request_reviews?.bypass_pull_request_allowances
                ? {
                    users:
                      required_pull_request_reviews?.bypass_pull_request_allowances?.users?.map(
                        (user) => user.name as string,
                      ) || [],
                    teams:
                      required_pull_request_reviews?.bypass_pull_request_allowances?.teams?.map(
                        (team) => team.name,
                      ) || [],
                    apps:
                      required_pull_request_reviews?.bypass_pull_request_allowances?.apps?.map(
                        (app) => app.name,
                      ) || [],
                  }
                : undefined,
          },
          required_status_checks: required_status_checks
            ? {
                strict: required_status_checks?.strict || false,
                contexts: required_status_checks?.contexts || [],
                checks: [],
              }
            : null,
          restrictions: restrictions
            ? {
                users: restrictions?.users.map((u) => u.login as string) || [],
                teams: restrictions?.teams.map((u) => u.name as string) || [],
                apps: restrictions?.apps.map((u) => u.name as string) || [],
              }
            : null,
          owner: owner,
          repo: repository.name,
          branch: repository.default_branch,
          lock_branch: true,
        });
      } catch (error) {
        Service.logger.info(
          `The ${repository.default_branch} isn't protected.`,
        );

        await octokit.repos.updateBranchProtection({
          enforce_admins: null,
          required_pull_request_reviews: null,
          required_status_checks: null,
          restrictions: null,
          owner: owner,
          repo: repository.name,
          branch: repository.default_branch,
          lock_branch: lockState,
        });
      }

      Service.logger.info(`The ${repository.default_branch} has been locked.`);
    }
  }
}
