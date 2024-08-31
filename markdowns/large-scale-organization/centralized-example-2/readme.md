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
```

The directory structure above represents one Pulumi project (monolithic stack) with an API-Gateway, DynamoDB tables. 

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
```

In this application, we can see two Pulumi projects. The main project manages DynamoDB Tables. The other Pulumi project manages the API Gateway. These are two micro-stacks, as we have successfully broken down the complex project into two smaller projects.

This approach has introduced a lot of benefits for developers:

- Added Security: Users can provide permission for specific users to deploy specific resources by splitting them into separate stacks.

- Improved Performance: With micro-stacks, each project contains fewer resources. Therefore, your deployment and build times are faster than deploying a monolithic structure project.

- Improved Independence: You can separate your infrequently updated resources into a separate stack to ensure that no-unnecessary changes occur to them.

### How Do I Split My Project into Micro-Stacks?
We've talked about this part while mentioning about layers. However a quick summary:

- You can split each micro-service in your application as a micro-stack.

- You can split your container and serverless-based functions into two stacks to deploy them independently.

- You can split your project based on infrastructure. For example, you could break your core infrastructure such as Routing, DNS, VPC to one stack, your Database Tables, SNS Topics, Queues to another stack, and finally, your API Gateway to another stack.


When using micro-stacks, you may wonder how you can access your resources across Pulumi projects -> Stack References

### Creating first pulumi project with Go

I've created below command at root level folder

`pulumi new aws-go`

so it creates a go project template for a simple pulumi project. I will use it as entrypoint project to call other stacks or combine with them.

I've also added some configuration to use at my stack which specifies the environment name.
Open `Pulumi.dev.yaml`

```
config:
  aws:region: us-east-1
  core-infrastructure:env: development
```

This will help refer to the stage variables across stacks

Now I want to create a dynamodb at my pulumi project and use it between other micro-stacks

So your file structure will look like below:

```
.
├── Pulumi.dev.yml
├── Pulumi.yml
├── database
│   └── table.go
├── main.go
```

I've already created them, you can find in this repository at example-2. You will find code at `table` folder.


Resources need to be shared across stacks. To do this, we must export resource ARNs and names from the current stack to be referred to in other stacks.


So exported this values at `main.go` file
```
		ctx.Export("testTableArn", table.Arn)
		ctx.Export("testTableName", table.Name)
```

It is important to note that when accessing these resources from different stacks, we must refer to the same variable names (testTableArn, testTableName) as the ones exported.

After this, If you want to test, you can provision the DynamoDB table by executing the command shown below.

```
// creates faster deployments by disabling previews.
pulumi up --skip-preview --stack stack-name --yes
```

After running the command, you should see your resources provisioned on AWS in the specified region.



### Creating the Second Pulumi Project

Let's create another Pulumi project responsible for maintaining a frequently changed resource (API Gateway).

We can use the exported table names from the first project and refer them to the second project’s Lambda functions to perform CRUD operations against the table.

Let's create second Pulumi project with `typescript`, execute the command below:
```
mkdir api-gateway && cd api-gateway
pulumi new aws-typescript
```


After creating the new project, open the `api-gateway/Pulumi.dev.yaml` file and add the configuration shown below

```
config:
  aws:region: us-east-1
  api-gateway:env: development
  api-gateway:core-org: <<YOUR-ORGANIZATION-NAME>>
  api-gateway:core-stack: dev or <<REFERRER STACK for current dev>>
  api-gateway:core-project-name: core-infrastructure or <<REFERRER PROJECT NAME>>
```


then you can check `api-gateway/index.ts` to see how to establish a connection with the referrer stack. For this constructor, it requires a string with the format `organization/project/stack`.



Now in the root directory, create a new directory, and inside that, create a file named `lambda.ts`.
This file will declare the micro-service and its Lambda function by adding the below code to the `lambda.ts` file. Check this file, you will see three lambdas declared above provide create, update and get operations on the Test table.


After you have an up and running api gateway and it's endpoints, you can fetch it's url from pulumi stack output and send request to api endpoint for testing your functionalities


### When should you use Micro-Stacks?

- Your monolithic project has a lot of resources where only limited resources are updated frequently.
- Your project has a component that takes a deployment time overhead.




This examples are taking from referenced link to explore micro-stacks and highlighted the advantages of using micro-stacks.




### References
[Explaining Monolith stack to Micro-stacks](https://blog.bitsrc.io/managing-micro-stacks-using-pulumi-87053eeb8678)
- I've used contents of this article mostly in this template. I think it explains well. I will have one more example template as example-3.

