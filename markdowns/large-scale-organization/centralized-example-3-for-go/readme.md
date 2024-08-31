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






### Reference

- [An example structure for Golang](https://maheshchandraregmi.com.np/structuring-infrastructure-as-code-with-a-layered-approach)
