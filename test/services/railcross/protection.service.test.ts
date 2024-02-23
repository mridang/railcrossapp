import { Octokit } from '@octokit/rest';
import ProtectionService from '../../../src/services/railcross/protection.service';

describe('protection.service test', () => {
  const repoName: string = process.env.JEST_GITHUB_REPO as string;
  const githubPat: string = process.env.JEST_GITHUB_PAT as string;

  test('that branches get protected"', async () => {
    const protectionService = new ProtectionService(() => {
      return new Octokit({
        auth: githubPat,
      });
    });

    expect(
      await protectionService.toggleProtection(repoName, 0, true),
    ).toMatchObject({
      url: `https://api.github.com/repos/${repoName}/branches/master/protection`,
      required_pull_request_reviews: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/required_pull_request_reviews`,
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
        required_approving_review_count: 1,
      },
      required_signatures: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/required_signatures`,
        enabled: false,
      },
      enforce_admins: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/enforce_admins`,
        enabled: false,
      },
      required_linear_history: { enabled: false },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      block_creations: { enabled: false },
      required_conversation_resolution: { enabled: false },
      lock_branch: { enabled: true },
      allow_fork_syncing: { enabled: false },
    });

    expect(
      await protectionService.toggleProtection(repoName, 0, false),
    ).toMatchObject({
      url: `https://api.github.com/repos/${repoName}/branches/master/protection`,
      required_pull_request_reviews: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/required_pull_request_reviews`,
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
        required_approving_review_count: 1,
      },
      required_signatures: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/required_signatures`,
        enabled: false,
      },
      enforce_admins: {
        url: `https://api.github.com/repos/${repoName}/branches/master/protection/enforce_admins`,
        enabled: false,
      },
      required_linear_history: { enabled: false },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      block_creations: { enabled: false },
      required_conversation_resolution: { enabled: false },
      lock_branch: { enabled: false },
      allow_fork_syncing: { enabled: false },
    });
  });
});
