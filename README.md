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

Railcross is built with Typescript 5.3 using the NestJS and
requires Node 20 to run.

After checking out the repository, run `npm install` to install all
the required dependencies.

To develop the application, you must have a GitHub app of
your own.

Configure the `.env` file with the necessary information. This file has
be configured with example values.

- `APP_ID` is the unique identifier of your app and is used for authenticating to the GitHub API
- `CLIENT_ID` is the unique client identifier of your app and is used for authenticating to the GitHub API
- `WEBHOOK_SECRET` is the webhook secret of your app and is used for validating the webhook signatures
- `JEST_GITHUB_PAT` is a personal access token used for the integration tests.
- `JEST_GITHUB_REPO` is the name of a repository that is used for the integration tests.

> [!NOTE]
> It is fine to add sensitive information to this file as this file only
> serves as a template and Git has been configured to not track any
> changes this file using `git update-index --assume-unchanged .env`

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

If configured correctly, you should be able to run all the tests from
your IDE.

Jest has been configured to automatically collect coverage from tests
and these can be found in the `.out` directory.

### Running the app

To run the application locally, you can simply run `npx nest start`
which starts the NestJS application for local usage.

> [!IMPORTANT]
> It is important to keep in mind that the way application runs locally
> is different from how it runs on Lambda. This is due to shortcomings
> in the Serverless framework that make emulating a Lambda environment
> hard.

Assuming that you have followed the instructions and configured
everything correctly, you should be able to go to
`http://localhost:3000/status` to see a health-check page that
reads "OK". If you've managed to get here, it indicates that the
application has been able to correctly initialize itself.

## Contributing

If you have suggestions for how Railcross could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

## License

Apache License 2.0 © 2024 Mridang Agarwalla
