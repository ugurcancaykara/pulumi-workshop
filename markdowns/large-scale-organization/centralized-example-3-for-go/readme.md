### Example pattern for managing IaC with Pulumi Go

I've already created 2 different examples, I'm not going to create pulumi templates for each folder. I'm going to share this template which I found while making researches about structuring golang IaC with pulumi, so you can easily create your directory hiearchy and pulumi templates.


If you prefer a tree view, this is how you can structure the codebase written using Pulumi SDK in Golang.


```
./layers/
├── application
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
├── assets
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
├── certs
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
├── compute
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
├── data
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
├── ingress
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.yaml
└── network
    ├── main.go
    ├── Pulumi.dev.yaml
    └── Pulumi.yaml
```



### An Example Complete Project Structure

It resembles something like this.

```
.
├── assets
├── base
│   ├── Dockerfile.infras-builder
│   └── Makefile
├── env
│   └── override.mk
├── go.mod
├── go.sum
├── internal
│   └── file
│       └── main.go
├── layers
│   ├── application
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   ├── assets
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   ├── certs
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   ├── compute
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   ├── data
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   ├── ingress
│   │   ├── main.go
│   │   ├── Pulumi.dev.yaml
│   │   └── Pulumi.yaml
│   └── network
│       ├── main.go
│       ├── Pulumi.dev.yaml
│       └── Pulumi.yaml
├── main.go
├── Makefile
├── pkg
│   ├── acm-certificate
│   │   └── main.go
│   ├── ecr-repository
│   │   └── main.go
│   ├── ecs-cluster
│   │   └── main.go
│   ├── ecs-service-v2
│   │   ├── main.go
│   │   └── types.go
│   ├── label
│   │   └── main.go
│   ├── load-balancer
│   │   ├── main.go
│   │   └── target_group.go
│   ├── mongo-database
│   │   └── main.go
│   ├── postgres-database
│   │   └── main.go
│   ├── s3-cloudfront-website
│   │   └── main.go
│   ├── security-group
│   │   ├── main.go
│   │   └── rule.go
│   └── ssm-parameters
│       └── main.go
├── policies
│   └── ssm-parameter.access.json
└── targets
    ├── docker.mk
    ├── go.mk
    └── pulumi.mk
```


### Explanation

Makefiles have been used heavily in this structure, you can reduce them if you want. I will explain how they can simply get used for different actions.


#### targets

Everything that needs to be run from automation is grouped into the CLI it invokes. For example: dockerized commands, go into the `docker.mk`, go building/ linting/ vendoring commands go into the `go.mk` file

#### pkg

This folder contains the Pulumi components that have been created to abstract all the resources required for one logical component. For example: the ecs-service-v2 creates EBS volumes, ECS task definitions, and ECS service itself.

#### layers

Every layer of the above diagram resides in a respective folder inside of the layers folder. Each of those packages produces a binary which is then passed with `LAYER_NAME` to the make command to operate on a single layer at a time.

#### env

This folder contains the environment variables required for the whole deployment to function. It also sets some handy variables like GOCACHE, GOPATH, and PULUMI_HOME to ensure I have a caching mechanism and a pretty fast build cycle in local environment.

These things will be directly set when running the IaC in CI/CD platform.


#### Example workflow

You can certainly have much better flows, I'm sharing these to create just an idea



`override.mk`
```Makefile
# Environment Variables Setup for Go and Pulumi Development
# GOCACHE: Specifies the cache directory for compiled Go packages. This is helpful for speeding up recompilations.
export GOCACHE=$(HOME)/.cache/go-build

# GOPATH: Defines the workspace location for Go projects and their binaries.
export GOPATH=$(HOME)/go

# PULUMI_HOME: Sets the home directory for Pulumi. This is where state files and configurations are stored.
export PULUMI_HOME=$(HOME)/.pulumi

# Project-Specific Settings
# PROJECT_NAME: Specifies the name of the project. This can be used in scripts that automate infrastructure deployments.
export PROJECT_NAME=my_project

# LOG_LEVEL: Sets the verbosity level of logging output, crucial for monitoring infrastructure deployments.
export LOG_LEVEL=debug
```




### Base Folder


`Dockerfile.infras-builder`
- This is general `Dockerfile` for CI/CD

```
# Use an alpine image as the base.
FROM alpine:latest

# Install necessary packages.
RUN apk add --no-cache curl bash jq

# Install Pulumi CLI.
RUN curl -fsSL https://get.pulumi.com | bash

# Set the working directory.
WORKDIR /app

# Copy your Pulumi projects into the Docker image.
COPY . .

# Default command that does nothing specific, can be overridden from the command line.
# I have used `CMD` instead of `ENTRYPOINT` to provide more flexibility
CMD ["sh"]

```


### Targets 
These makefiles are for local development etc. You can adjust them depending to your local development workflow.


`docker.mk`
- This Makefile handles all Docker-related tasks, such as building images, running containers, and cleaning up.

```Makefile
# This Makefile handles Docker-related tasks.

# Build the Docker image.
build-infras:
	@echo "Building the Docker image..."
	docker build -t pulumi-infras-builder -f Dockerfile.infras-builder .

# Run the Docker container with an environment variable to specify the project.
# Usage: make run-infras PROJECT=compute
run-infras:
	@echo "Running the Docker container..."
	docker run -it --rm -v $(PWD):/app -e PROJECT=$(PROJECT) pulumi-infras-builder sh -c "cd $$PROJECT && pulumi up"

# Clean up Docker images.
clean:
	@echo "Cleaning up Docker images..."
	docker rmi pulumi-infras-builder
```

### Usage of `docker.mk`
- You can run below commands for your pulumi tests

Run to build infra image
```
make build-infras
```

Run to execute pulumi commands for specific projects
```
make run-infras PROJECT=compute
```




`go.mk`
- This Makefile includes commands for Go-related tasks such as building the application, running locally, and executing tests.

```makefile
# This Makefile handles Go build and local run tasks.

# Run Go tests inside the Docker container for a specified project.
# Usage: make test PROJECT=compute
test:
	@echo "Running Go tests for the $(PROJECT) project..."
	docker run -it --rm -v $(PWD)/$(PROJECT):/app pulumi-infras-builder go test ./...

# Run Go tests locally for a specified project.
# Usage: make local-test PROJECT=network
local-test:
	@echo "Running local Go tests for the $(PROJECT) project..."
	cd $(PROJECT) && go test ./...
```


### Usage of `go.mk`
Run go tests inside the docker container for a specified project
```
make test PROJECT=compute
```

Run go tests locally for a specified project
```
make local-test PROJECT=network
```


`pulumi.mk`
- For managing Pulumi-specific tasks, such as updating or destroying resources.

```Makefile
# This Makefile manages Pulumi-specific tasks, allowing path-based operations.

# Deploy Pulumi configurations for a specified project.
# Usage: make deploy-pulumi PROJECT=network
deploy-pulumi:
	@echo "Deploying Pulumi configurations for the $(PROJECT) project..."
	cd $(PROJECT) && pulumi up

# Refresh and update Pulumi configurations for a specified project.
# Usage: make refresh-pulumi PROJECT=compute
refresh-pulumi:
	@echo "Refreshing Pulumi stacks for the $(PROJECT) project..."
	cd $(PROJECT) && pulumi refresh

# Destroy Pulumi managed infrastructure for a specified project.
# Usage: make destroy-pulumi PROJECT=network
destroy-pulumi:
	@echo "Destroying Pulumi managed resources for the $(PROJECT) project..."
	cd $(PROJECT) && pulumi destroy

```




`Makefile`
- This main `Makefile` includes all the smaller Makefile modules for easy management of various tasks.

```Makefile
# Main Makefile that orchestrates various task-specific Makefiles with path-based operations.

include docker.mk
include go.mk
include pulumi.mk

# Default task when none specified.
all:
	@echo "Please specify a task and optionally a project. For example, 'make deploy-pulumi PROJECT=network'"

# Helper task for building Docker images for a specific project.
build-docker:
	@$(MAKE) build-infras PROJECT=$(PROJECT)

# Helper task for running Docker containers for a specific project.
run-docker:
	@$(MAKE) run-infras PROJECT=$(PROJECT)

# Helper task for deploying Pulumi configurations for a specific project.
deploy:
	@$(MAKE) deploy-pulumi PROJECT=$(PROJECT)

# Helper task for refreshing Pulumi configurations for a specific project.
refresh:
	@$(MAKE) refresh-pulumi PROJECT=$(PROJECT)

# Helper task for destroying Pulumi resources for a specific project.
destroy:
	@$(MAKE) destroy-pulumi PROJECT=$(PROJECT)

# Helper task for running tests in a specific project.
test:
	@$(MAKE) test PROJECT=$(PROJECT)
```




### Create a pre-commit hook to enforce code quality checks before commits are finalized

#### Using pre-commit hooks as bash scripts

- Navigate to `.git/hooks` directory: This directory is inside your Git repository. If you don't see, create `hooks` folder under `.git` folder

- Create a new script called pre-commit 

- Add the following content to the `pre-commit` script:

```bash
#!/bin/sh

# Stash non-staged changes to keep working directory clean
git stash -q --keep-index

echo "Running Go fmt..."
gofmt -s -w $(find . -type f -name '*.go' ! -path "./vendor/*")

echo "Running Go vet..."
go vet ./...

echo "Running golangci-lint..."
golangci-lint run ./...

# Store the linting result
RESULT=$?

# Unstash changes that were stashed earlier
git stash pop -q

# Check if linting passed
[ $RESULT -ne 0 ] && exit 1

exit 0

```

- Make the pre-commit script executable
    - In the terminal, run the following command while in the `.git/hooks` directory:
        - `chmod +x pre-commit`

Explanation of the Script

- Go fmt: This command formats Go code in your project according to the Go conventions.

- Go vet: It examines Go source code and reports suspicious constructs, such as unreachable code.

- golangci-lint: Runs a suite of linters to check for various issues like unused variables, coding style violations, and more.

- Stashing Changes: Non-staged changes are stashed before the checks to ensure that only staged changes are tested. Changes are then unstashed regardless of the check results.


#### Leveraging pre-commit framework

- Install the Pre-Commit Tool:
```bash
# Using pip
pip install pre-commit

# Using Homebrew on macOS
brew install pre-commit
```

- Create a `.pre-commit-config.yaml` File

Sample
```yaml
repos:
  - repo: local
    hooks:
      - id: gofmt
        name: gofmt
        entry: gofmt -s -w
        language: system
        types: [go]
        files: \.go$

      - id: go-vet
        name: go-vet
        entry: go vet ./...
        language: system
        types: [go]

      - repo: https://github.com/golangci/golangci-lint
        rev: v1.41.1  # Use the specific version of golangci-lint
        hooks:
          - id: golangci-lint
            args: ['--enable-all']

```

**Using the Pre-Commit Configuration**

1. **Install the Pre-Commit Hooks:** Run the following command in your repository to install the hooks defined in your .pre-commit-config.yaml:


```bash
pre-commit install
```

2. **Making a Commit:** When you make a commit, the pre-commit hooks defined will automatically run. If any hook fails, the commit will be aborted, and you’ll need to fix the issues.






### Task files are also can be quite readable compared to Makefiles

So here is a taskfile example for the defined tasks in makefile

```yaml
version: '3'

# Define variables that can be used in tasks
vars:
  PULUMI_HOME: "{{.HOME}}/.pulumi"

tasks:
  # Docker Tasks
  build-infras:
    desc: "Build the Docker image for the infrastructure builder."
    cmds:
      - echo "Building the Docker image..."
      - docker build -t pulumi-infras-builder -f Dockerfile.infras-builder .

  run-infras:
    desc: "Run the Docker container for a specified project to test or develop."
    cmds:
      - echo "Running the Docker container for project development..."
      - docker run -it --rm -e PROJECT={{.PROJECT}} pulumi-infras-builder sh -c "cd {{.PROJECT}} && pulumi up"

  clean-infras:
    desc: "Clean up Docker images."
    cmds:
      - echo "Cleaning up Docker images..."
      - docker rmi pulumi-infras-builder

  # Pulumi Tasks
  deploy:
    desc: "Deploy Pulumi configurations for a specified project."
    cmds:
      - echo "Deploying Pulumi configurations for the project..."
      - cd {{.PROJECT}} && pulumi up

  refresh:
    desc: "Refresh and update Pulumi configurations for a specified project."
    cmds:
      - echo "Refreshing Pulumi stacks for the project..."
      - cd {{.PROJECT}} && pulumi refresh

  destroy:
    desc: "Destroy Pulumi managed infrastructure for a specified project."
    cmds:
      - echo "Destroying Pulumi managed resources for the project..."
      - cd {{.PROJECT}} && pulumi destroy

```

#### Usage of Taskfile

**Clarified Docker and Pulumi Task Usage:**

- The run-infras task can be used for development and testing purposes, where you might want to see the effects of changes in a controlled environment without affecting production or other stages.

- The deploy task is clearly intended for actual deployments, possibly tied into your CI/CD pipelines for staging or production deployments.


#### Usage Guidance

- **For Development:** Use task run-infras -- PROJECT=your_project_name when you want to test changes locally or in a development environment without affecting other environments.

- **For Deployment:** Use task deploy -- PROJECT=your_project_name when you are ready to deploy changes to a staging or production environment.

- **For Refreshing State:** Use task refresh -- PROJECT=your_project_name to synchronize your Pulumi state with the actual cloud resources state.

- **For Destruction:** Use task destroy -- PROJECT=your_project_name when you need to tear down resources managed by Pulumi for a specific project.

### Reference

- [An example structure for Golang](https://maheshchandraregmi.com.np/structuring-infrastructure-as-code-with-a-layered-approach)
