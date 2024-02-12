# Railcross for GitHub

> A brief description of what your Probot app does.

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

````shell
# Clone the repository
git clone [repository URL]
cd [repository name]

# Install dependencies
npm install

# Run the bot
npm start


## Features

- **Feature 1:** Description of feature 1.
- **Feature 2:** Description of feature 2.
- **Feature 3:** Description of feature 3.

## Configuration

Explain how users can configure your Probot app. This might include creating a `.github/[probot-app-name].yml` file in their repository and specifying configuration options.

```yml
# .github/[probot-app-name].yml
option1: value
option2: value
````

## Usage

Provide examples on how the app can be used, including any commands it listens to, any tags it responds to, or any other actions it can perform.

## Developing

Railcross is built with Typescript using the Probot framework and
requires Node 20 to run.

After checking out the repository, run `npm install` to install all
the required dependencies.

In order to develop the application, you must have a GitHub app of
your own.

### Linting the code

Lint the code using `npm run lint`. This command runs ESLint and
lints all the files.

### Formatting the code

Reformat the code using `npm run format`. This runs Prettier and
reformats all the code.

### Deploying the app

Deploy the app using `npm run deploy`.

⚠️You'll need to ensure that you have the AWS credentials configured. Read the
guide on how to configure the variables https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html

### Running tests

Run the test suite using `npm run test`

## Contributing

If you have suggestions for how Railcross could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

Apache License 2.0 © 2024 Mridang Agarwalla
