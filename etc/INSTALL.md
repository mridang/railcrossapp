Railcross prevents your teams from merging pull requests
outside merge windows. Merge windows allow you to restrict the days and times that pull
requests may be merged.

Think of it as a railway crossing, you can't cross until the train
has passed. 🚂 Railcross is a low-overhead app and simply prevents
your team from merging outside the allowed window.

Once installed and configured, Railcross will lock the default branch of
your repository automatically. It does this by creating a branch-protection
rule for the default branch of the repository.

![](https://github.com/mridang/railcross/assets/327432/8e519977-abe7-439c-ab7a-9881758fc9d5)

Any existing branch protection rules aren't affected as Railcross simply
locks and unlocks the branch while preserving any existing
configuration.

![](https://github.com/mridang/railcross/assets/327432/dd15736f-a067-4f6c-90a4-2dbbcde07471)

When the default branch is locked, users will no longer be able to push
to the default branch.

![](https://github.com/mridang/railcross/assets/327432/9cbcb9a0-4ac5-4c2a-a13e-e23d41a74183)

When the branch is unlocked, users are once again able to merge normally.

![](https://github.com/mridang/railcross/assets/327432/c1a7e15d-b0a5-49cf-923a-f9b699b0408b)

## Install

Go to the [Railcross](https://github.com/apps/railcross) page on
GitHub Marketplace and click the **Install** button. Select the account
for which you want to install the app and grant the necessary permissions.

#### Why do you need these permissions?

Railcross needs the following two permissions to function.

- "Read access to metadata and pull requests" is required for **all**
  GitHub apps and is in this case used for deducing the default branch
  of the repository.

![](https://github.com/mridang/railcross/assets/327432/273bb703-4725-40d0-8b7c-8cac55589991)

- "Read and write access to administration" is required to be able to
  create, and update the branch protection rules.

Finally, choose the repositories where you want to install the app.

![](https://github.com/mridang/railcross/assets/327432/c4c4ecf8-40bc-4973-b9c4-ff84059d8518)

Once installed, you'll be redirected to a (very ugly) configuration
page where you can configure the lock and unlock times along with the
timezone.

## Gotchas

- If the default branch is changed while the app is installed, you must
  manually unlock that branch (in the event that it was locked.)

- All repositories are locked and unlocked at the same time, the app
  doesn't allow you to configure different windows for different repositories.
