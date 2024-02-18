# Railcross for GitHub

Railcross prevents your teams from merging pull requests outside
merge windows.
Merge windows allow you to restrict the days and
times that pull requests may be merged.

Think of it as a railway crossing, you can't cross until the
train has passed. 🚂

Railcross is a low-overhead app and simply prevents your team
from merging between 0900 and 1600. It does this by locking the
branch protection rule of your default branch.
Any existing branch protection rules (even on the same branch) are not affected.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Configuration](#configuration)
- [Usage](#usage)
- [Developing](#developing)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Go to the [Railcross](https://github.com/apps/railcross) page on GitHub Marketplace
2. Click the **Install** button
3. Choose the repositories where you want to install the app

Alternatively, you can deploy your own instance of [Probot App Name] by following these steps:

## Usage

## Developing

Railcross is built with Typescript using the NestJS and
requires Node 20 to run.

After checking out the repository, run `npm install` to install all
the required dependencies.

To develop the application, you must have a GitHub app of
your own.

### Linting the code

Lint the code using `npm run lint`. This command runs ESLint and
lints all the files. To automatically fix any fixable lint errors, run
`npm run lint:fix`.

> [!NOTE]
> GitHub Actions has been configured to automatically fix all fixable
> lint errors on every commit and commit the changes back to the branch.

### Formatting the code

Reformat the code using `npm run format`. This runs Prettier and
reformats all the code.

> [!NOTE]
> Github Actions has been configured to automatically reformat all the
> code on every commit and commit the changes back to the branch.

### Deploying the app

Deploy the app using `npm run deploy`.

> [!IMPORTANT]
> You'll need to ensure that you have the AWS credentials configured. Read the
> guide on how to configure the variables https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html

### Running tests

Run the test suite using `npm run test`. Most tests are designed to use
Localstack when possible. Jest automatically starts the containers defined
in `docker-compose.yml`.

> [!NOTE]
> If you run into any issues while running the tests locally, ensure that
> no other services are currently listening on the same ports used by the
> services defined in `docker-compose.yml`.
> Run `docker ps` to list all currently running containers. Any containers
> listening on the required ports should be stopped prior to running the
> test suite again.

> [!IMPORTANT]
> Some tests run against the GitHub API and require both a token and a
> test repository to be configured. To run all GitHub integration tests,
> you must create a repository called "<owner>/testing" and create a
> personal access token (PAT). Once complete, export them as environment
> variables.
>
> ```
> export JEST_GITHUB_REPO=owner/repo
> export JEST_GITHUB_PAT=github_pat_11AAC
> ```
>
> On GitHub, these can simply be configured as environment variables
> https://docs.github.com/en/actions/learn-github-actions/variables

## Contributing

If you have suggestions for how Railcross could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

Apache License 2.0 © 2024 Mridang Agarwalla
