## Example directory hierachy 2

### Introduction

This is also another representation of example micro-stack architecture. Let's get dive in difference between monolith and micro-stacks. And explain the hierarchy.

### Exploring Micro-Stacks

In layman’s terms, micro-stacks are the equivalent of micro-services, in the form of projects/stacks. You divide your main project into multiple smaller projects and share resources between each project.


#### Micro-Stacks vs. Monolithic-Stacks

#### Monolithic Stacks

Let us look at the sample application managed using AWS resources shown below.

```
.
├── Pulumi.dev.yml
├── Pulumi.prod.yml
├── Pulumi.yml
├── api-gateway
│   ├── index.ts
│   ├── micro-service-01
│   │   └── index.ts
│   └── micro-service-02
│       └── index.ts
├── database
│   ├── table-01.ts
│   └── table-02.ts
├── index.ts
├── package-lock.json
├── package.json
├── ses
│   └── templates.ts
├── sns
│   └── topics.ts
└── sqs
└── queues.ts
```

The directory structure above represents one Pulumi project (monolithic stack) with an API-Gateway, DynamoDB tables, SNS Topics, Queues, and SES Templates.

At first glance, it does not seem to be problematic. But as the application grows, this project structure loses its capability to scale by introducing issues such as:

- Lack of independence: You may have infrastructure such as Domain Verification, VPC Configurations that infrequently change, along with Lambda functions (in your API Gateway) to change frequently. Therefore, when using deployments, you will need to closely monitor your infrastructure to ensure that any unnecessary changes do not occur.

- Lack of security on individual infrastructure: With a monolithic project structure, you cannot restrict deployments on resources for specific users. For example, you may require only your team lead to deploy core infrastructure. However, this cannot be done in monolithic stacks as permissions get created for the entire stack.


#### Micro-Stacks


Pulumi introduced Micro-Stacks to mitigate the above issues discussed. Let us take a look at the application shown below

```
.
├── Pulumi.dev.yml
├── Pulumi.yml
├── api-gateway
│   ├── Pulumi.dev.yml
│   ├── Pulumi.yml
│   ├── index.ts
│   ├── micro-service-01
│   │   └── lambdas.ts
│   └── package.json
├── database
│   └── table.go
├── main.go
├── ses
│   └── templates.go
├── sns
│   └── topics.go
└── sqs
    └── queues.go
```

In this application, we can see two Pulumi projects. The main project manages SES resources, SNS Topics, Queues, DynamoDB Tables. The other Pulumi project manages the API Gateway. These are two micro-stacks, as we have successfully broken down the complex project into two smaller projects.

This approach has introduced a lot of benefits for developers:

- Added Security: Users can provide permission for specific users to deploy specific resources by splitting them into separate stacks.

- Improved Performance: With micro-stacks, each project contains fewer resources. Therefore, your deployment and build times are faster than deploying a monolithic structure project.

- Improved Independence: You can separate your infrequently updated resources into a separate stack to ensure that no-unnecessary changes occur to them.

### How Do I Split My Project into Micro-Stacks?
We've talked about this part while mentioning about layers. However a quick summary:

- You can split each micro-service in your application as a micro-stack.

- You can split your container and serverless-based functions into two stacks to deploy them independently.

- You can split your project based on infrastructure. For example, you could break your core infrastructure such as Routing, DNS, VPC to one stack, your Database Tables, SNS Topics, Queues to another stack, and finally, your API Gateway to another stack.






[Explaining Monolith stack to Micro-stacks](https://blog.bitsrc.io/managing-micro-stacks-using-pulumi-87053eeb8678)
- I think this medium blog will help you to understand difference between monolith and micro-stack architecture when it comes to Pulumi.

