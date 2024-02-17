import { Octokit } from '@octokit/rest';
import ProtectionService from '../../src/services/lockdown/protection.service';

describe('protection.service test', () => {
  test('that branches get protected"', async () => {
    const protectionService = new ProtectionService(() => {
      return new Octokit({
        auth: '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',
      })
    });

    expect(
      await protectionService.toggleProtection('mridang/testing', 0, true),
    ).toMatchObject({
      url: 'https://api.github.com/repos/mridang/testing/branches/master/protection',
      required_pull_request_reviews: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/required_pull_request_reviews',
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
        required_approving_review_count: 1,
      },
      required_signatures: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/required_signatures',
        enabled: false,
      },
      enforce_admins: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/enforce_admins',
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
      await protectionService.toggleProtection('mridang/testing', 0, false),
    ).toMatchObject({
      url: 'https://api.github.com/repos/mridang/testing/branches/master/protection',
      required_pull_request_reviews: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/required_pull_request_reviews',
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
        required_approving_review_count: 1,
      },
      required_signatures: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/required_signatures',
        enabled: false,
      },
      enforce_admins: {
        url: 'https://api.github.com/repos/mridang/testing/branches/master/protection/enforce_admins',
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
