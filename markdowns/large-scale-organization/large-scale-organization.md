# **Large-Scale Project Organization with Pulumi**
**Note1: Structuring a layout for your directories is not specific to Pulumi you can leverage this concept at other IaC tools**

**Note2: Some of the below are specific to Pulumi concepts(Pulumi libraries), I will mention as `pulumi internal` to express this is something specific to Pulumi**

**Note3: I will drop reference links that are provided insights and guided me to answer these questions**


## Introduction
I think, understanding and implementing IaC, and structuring it is essential for your teams' scalability, maintainability, overall productivity and efficiency in infrastructure development. I believe there are key points when it comes to structuring your IaC project:

### How to structure your projects
- monorepo vs. multi-repo 

### Directory Hierarchy
- file, folder levels

### Stacks and Micro Stacks(Pulumi Internal)
- how to organize your stacks, and differentiate between stacks and micro stacks
    - organizing your project at codebase level
 
### Tradeoffs
Everything described within here is on a spectrum of tradeoffs. Remember that each project(**pulumi project**) is a collection of code, each organization(**business itself**) is living in its own rules, and that each stack(**pulumi stack**) is a unit of deployment. Each stack has its own separate configuration and secrets, role-based access controls (RBAC) and policies, and concurrent deployments.


## **Project Structure**

There’s no canonical answer. Everyone does things slightly different, and different tools have different ideas on the best way.

### Layered Infrastructure Approach

#### Layer 0: Billing
The billing layer is where you sign up or input your credit card. Each cloud provider does this differently

- **AWS**: Organization
- **Azure**: Account
- **Google Cloud**: Account

### Layer 1: Privilege

The privilege layer is how you fundamentally separate access in the cloud provider. Again, each provider does this a little differently.

#### Example Resources

- **AWS**: Account
- **Azure**: Subscription
- **Google Cloud**: Project

### Layer 2: Network

Now we’re getting to the layers that’ll should definitely be managed by IaC. The network layer is foundational to how everything will work in your infrastructure, and includes things like a VPC, subnets, NAT Gateways, VPNs, and anything else that facilitates network communication.

#### Example Resources

- **AWS**: VPCs, Subnets, Route Tables, Internet Gateways, NAT Gateways, VPNs
- **Azure**: Virtual Networks, Subnets, Route Tables, Internet Gateways, NAT Gateways, VPNs
- **Google Cloud**: VPCs, Subnets, Route Tables, Internet Gateways, Cloud Nat, VPNs

### Layer 3: Permissions

Now we’ve laid down a network layer, we need to allow other people or applications to talk to the cloud provider API. IAM roles, or service principals live in this layer.

#### Example Resources

- **AWS**: IAM Roles, IAM Users, IAM Groups
- **Azure**: Service Principals, Managed Identities
- **Google Cloud**: Service Accounts

### Layer 4: Data

The data layer is where the resources you’re managing really start to open up. This is where you’ll find things like databases, object stores, message queues, and anything else that’s used to store or transfer data.

#### Example Resources

- **AWS**: RDS, DynamoDB, S3, SQS, SNS
- **Azure**: SQL, CosmosDB, Blob Storage
- **Google Cloud**: Cloud SQL, Cloud Spanner

### Layer 5: Compute

The compute layer is where your applications actually run - this is where you’ll find things like virtual machines, containers, and serverless functions.

#### Example Resources

- **AWS**: EC2, ECS, EKS, Fargate
- **Azure**: Virtual Machines, Container Instances, AKS
- **Google Cloud**: Compute Engine, GKE

### Layer 6: Ingress

Layer 6 is where you’ll find the resources that allow your applications to be accessed by the outside world.

#### Example Resources

- **AWS**: Application Load Balancers, Network Load Balancers, Classic Load Balancers, API Gateways
- **Azure**: Application Gateways, Load Balancers, API Management
- **Google Cloud**: Load Balancers, API Gateways

### Layer 7: Application

Once we’ve provisioned all the supporting infrastructure, we now need to actually deploy the application itself. This is where things really get a little tricky and depend entirely on your application’s deployment model, technology and architecture.


You might choose not to use IaC for application at all, but if you do...


#### Example Resources

- **AWS**: Lambda, ECS Tasks, Kubernetes Manifests, EC2 User Data
- **Azure**: Azure Functions, Kubernetes Manifests
- **Google Cloud**: Cloud Functions, Kubernetes Manifests

### Visualization

Here is the visualization, it can be helpful though:

| Layer | Name | Example Resources |
|-------|------|-------------------|
| 0     | Billing | AWS Organization/Azure Account/Google Cloud Account |
| 1     | Privilege | AWS Account/Azure Subscription/Google Cloud Project |
| 2     | Network | AWS VPC/Google Cloud VPC/Azure Virtual Network |
| 3     | Permissions | AWS IAM/Azure Managed Identity/Google Cloud Service Account |
| 4     | Data | AWS RDS/Azure Cosmos DB/Google Cloud SQL |
| 5     | Compute | AWS EC2/Azure Container Instances/GKE |
| 6     | Ingress | AWS ELB/Azure Load Balancer/Google Cloud Load Balancer |
| 7     | Application | Kubernetes Manifests/Azure Functions/ECS Tasks/Google Cloud Functions |


---
## Core Organizational Principles

### Principle 1: The Rate of Change

Quantifying the rate at which infrastructure layers change is crucial. Typically, the foundational layers experience changes less frequently compared to the higher layers, which are often more dynamic but also carry greater risk during modifications.

Understanding the implications of this variability is vital when organizing your infrastructure with an IaC tool like Pulumi, which groups resources into projects based on their interdependencies and stability. When assigning resources to a Pulumi project, the primary consideration should be the layer the resource inhabits. Mixing resources from different layers within a single project can lead to complexities due to varying rates of change and associated risks.

### Principle 2: Resource Lifecycle

Life's general principles apply here too, where Principle 1 may not always fit perfectly.

There are infrastructure resources within the above layers where you might think like "yay, this is going to get in to layer 2" but the resource lifecycle doesn't necessarily fit as a shared resource. 

Consider a scenario involving network resources, such as AWS security groups, which are typically tied to specific applications, load balancers, or databases. These security groups, while seemingly fitting neatly within a network layer, actually have lifecycles closely tied to the resources they protect. Deciding their placement within your infrastructure requires considering the entire lifecycle of associated resources, including scenarios of provisioning in new environments or decommissioning.

In addition, the handling of permissions necessitates careful thought—shared permissions differ significantly from application-specific permissions, which are more suitably managed directly alongside application deployment scripts.

The takeaway is simple: flexibility in applying these principles is permissible, but always align your decisions with the overarching resource lifecycle.

### Principle 3: Repositories

The debate between using a mono-repo versus a multi-repo setup continues unabated and is unlikely to be resolved even as technology evolves beyond cloud computing.

In the context of IaC, the choice of repository structure should be influenced by the layering strategy. Decisions on where to house the deployment code should reflect the specific layer it manages, ensuring that each layer's unique requirements are addressed effectively. So it can be stored at core infrastructure(control repo -> will explain soon) repository where you manage lower layers or application repository itself which if it is a layer 7 resource.

### The Control Repo

For the core, shared infrastructure components, including these projects in a single repository is often beneficial.

Referring to our infrastructure layers:

- **Layers 1** and **2** are typically included in this shared repository.
- **Layer 3** (permissions layer) requires careful consideration. Shared resources like IAM roles for human users are suitable for the central repo.
- **Layer 4** depends on your application architecture. Shared components like message buses fit well in the central repo, while application-specific databases may not.
- **Layer 5** is influenced by your organization's permission model and cloud structure. Shared compute resources (e.g., ECS or Kubernetes clusters) are often included in the central repo. However, if you’re isolating compute on a per-application basis, you’re almost certainly going to want to make this application-specific.
- **Layer 6** placement depends on your application design and permission framework. Shared load balancers belong in the central repo, while application-specific ones should be in individual app repos.
    - **a quick note**: I heavily work with AWS and I prefer to manage load balancers within my `gitops` repository and provision it using ingress(`alb class`) resources since I want to manage all traffic via a centralized single source of truth.

### Application Repositories

For Infrastructure as Code (IaC) in application deployment:
- A `deploy/` directory in your app repo is a solid starting point.
- With Pulumi, consider using the same language as your application for deployments, with shared dependency files. So you might consider having all of your dependencies in a single `package.json` or `go.mod` depending on your chosen language.

When defining resource groups, consider the frequency of changes:
- Separating database layer and application layer resources might be beneficial due to different rates of change.
- Make decisions that align with your organization's needs and project requirements.


**!Note with Layer 7:** Personally, I prefer to use ArgoCD/Flux for k8s specific deployments however I maintain application relative infrastructure resources like lambda, apigateway within application repositories. Because it's a good practice to separate where you maintain your control repo resources and application related infra resources. So you won't end up with running your core infra codes for every changes that application developers want to do at their application relative infrastructure resources(like lambda, apigateway). Sometimes I managed those resources as yaml manifests using `Crossplane` CRDs embedded at application helm charts(a separate one), and sometimes I did use terraform/cdk code within same repository with application codebase in a different folder called `deploy/`. How I manage application deployment depends on the some factors. Mostly, these are
- involving developers into self-service development so they can built their infrastructure resources with the whatever way they want
    - Because it's important to guide developers and help them when they face with an issue however being just supportive not the developing application relative infrastructure code so we can focus on some other edge cases like gitops workflows, improving application/platform pipelines, release management, chaos engineering. So It's going to take a lot cognitive load from our shoulders. However this has to be done in correct way other ways you can have bloated bills at the end of the month:)
- It can be just deploying k8s yaml manifests and provisioning infrastructure
- It can be using terraform/cdk and now pulumi, so they can use whatever they feel comfortable with

These are mostly depending on the teams' skill sets, and ending up with picking the one that they feel most comfortable with depending on the technology that they are going to have up and running. 

### Why do this?

The primary reason for making the decision to use both mono-repos and keeping deployment code with applications is built from a perspective of ownership and orchestration.

Foundational infrastructure at layers 1, 2, and possibly up to layer 5 is an order of operations problem and a workflow orchestration problem. In most circumstances, you’ll be creating resources that depend on other resources while building the IaC graph.

By deciding to break the resources into different projects, you can create a workflow that allows you to deploy the resources in the correct order. You’ll be able to utilize [Pulumi stack references](https://www.pulumi.com/tutorials/building-with-pulumi/stack-references/) to share resources between stacks and projects, but you’ll need to ensure that a resource in a project in layer 2 that depends on a project in layer 1 has been created and resolved first.

In a mono-repo, this is as simple as ensuring that the workflow or CI/CD tool runs the projects in the correct order, but in a multi-repo implementation, it becomes a complex orchestration problem that likely involves multi-repo webhooks and a lot of duct tape.

Application repos are far enough down the layering system that all of the infrastructure required to run your application will be in place. Placing application deployment infrastructure code in the application repo allows you to give the application developers full ownership of their code from writing and features to getting them into production.

## Principle 4: Encapsulation

After setting the core strategies, you're progressing towards establishing a solid infrastructure as code setup. The next essential task is to figure out how to distribute resource patterns between your control and application repositories.

Different IaC tools manage this differently. In Pulumi, you can opt to build a [Component Resource](https://www.pulumi.com/docs/concepts/resources/components/) for a single language or, if you need support for various languages, you might look into creating a [Pulumi Package](https://www.pulumi.com/product/packages/). The main goal here is to bundle a collection of best practices to share across multiple projects.

Considering when to start encapsulating resources should take into account the structure of your organization and your application architecture. If it’s just one team working on a single application, encapsulation might not be necessary. However, if you are part of a platform team supporting multiple teams using a common compute resource at layer 5, developing a Pulumi package that consolidates best practices for deployment or a standard configuration for object storage with necessary permissions could simplify the process significantly.

Keep these encapsulations in a separate, specialized repository. Version these in the same manner as your applications, using semantic versioning and creating an API that your end-users can rely on. Follow semver and make sure you create an API that your downstream users can use.

As your downstream users start to depend on these encapsulations, you can introduce concepts like unit testing to make sure you don’t break userspace with your infrastructure.

## **Putting it together**
A picture is often more illuminating than extensive explanation, so let’s examine a fictional example of a control repository and an application repository.

## **Control Repo**
Here’s how `Control Repo` might look:

```
├── certs
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── main.go
│   ├── go.mod
│   └── go.sum
├── cluster
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── README.md
│   ├── main.go
│   ├── go.mod
│   └── go.sum
├── shared_database
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── main.go
│   ├── components
│   ├── go.mod
│   └── go.sum
├── shared_example_app
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── README.md
│   ├── main.go
│   ├── productionapp.go
│   ├── go.mod
│   └── go.sum
├── shared_bucket
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── main.go
│   ├── go.mod
│   └── go.sum
├── vpc
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   ├── main.go
│   ├── go.mod
│   └── go.sum
└── vpn
    ├── Pulumi.development.yaml
    ├── Pulumi.production.yaml
    ├── Pulumi.yaml
    ├── main.go
    ├── go.mod
    └── go.sum

```


You can see here that we’re using [Pulumi stacks](https://www.pulumi.com/tutorials/building-with-pulumi/understanding-stacks/) to target differing environments (in this case, development and production), and creating [a new project](https://www.pulumi.com/docs/concepts/projects/) for different layers and resources.

You’ll likely also notice that the way using directories for each set of services. It's not grouped all of the network/layer 2 resources into a single project, however, following the layering principle by not grouping any resources from different layers into the same project.

You can definitely reduce the number of projects here (for example, you might choose to group the VPC and VPN projects together in a network project) but general approach is to find that projects/directories are “free” and reducing the blast radius of changes makes people feel comfortable about contributing to these shared elements.

## **Application Repo**
Once we get to our application repo, it’s a lot harder to be prescriptive, but let’s say we have a simple Go application called example-app. Here’s how that might look:


```
.
├── Dockerfile
├── Makefile
├── docker-compose.yml
├── deploy
│   ├── Pulumi.development.yaml
│   ├── Pulumi.production.yaml
│   ├── Pulumi.yaml
│   └── main.go
├── go.mod
├── go.sum
├── main.go
├── readme.md
└── README.md
```

## [**Encapsulation Repo Example**](https://github.com/lbrlabs/pulumi-lbrlabs-eks)
Finally, let’s take a look at an example encapsulation repo. These repos can be quite complex, so as an example, take a look at this Pulumi package which encapsulates some level of compute here. It can ignite lights in your minds.

---

## **Splitting the Monolith**
### **Stack and Micro Stack Differentiation**

Like as caption goes, project structure at large scale, If your project is small, If your team is small, it's better to use one repository and put all your infrastructure resources in one pulumi project, cause you gonna most probably get most out of it as productivity manner. However as your infrastructure grows, you may need to further break down your stacks into micro stacks to manage complexity:

- **Stack Size and Scope**: A stack should be large enough to encapsulate a complete piece of functionality but small enough to remain manageable. If a stack becomes too large, consider splitting it into micro stacks.

- [**Component Resources**](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/#monorepo-with-base-infrastructure-project): Here is a good explanation of how you can evolve your infrastructure code into component resources to group specific resources and share them as public package, library.

- [**Micro Stacks**](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/#micro-stacks): Micro stacks are smaller, more focused stacks that handle a specific part of your infrastructure. For example, instead of having a single stack for all networking resources, [you might create micro stacks for different regions or availability zones](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/#moving-from-a-monolithic-project-structure-to-micro-stacks). This approach allows for finer-grained control and can reduce the blast radius of changes.

- **Dependency Management**: When working with multiple stacks and micro stacks, it’s important to manage dependencies carefully. Use Pulumi’s [stack references](https://www.pulumi.com/tutorials/building-with-pulumi/stack-references/) to allow stacks to share outputs and inputs, ensuring that your infrastructure remains consistent and connected.

- [**Tagging Stacks**:](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/#tagging-stacks) You can assign custom tags to stacks (when logged into the Pulumi Cloud backend to enable grouping stacks in the Pulumi Cloud(Choosing pulumi cloud or using custom backend's is another day's topic.)

## **Conclusion**

Effective project and stack organization are critical for managing large-scale infrastructures with Pulumi. By adopting a modular design, carefully organizing stacks and micro stacks, and considering scalability, you can build a resilient and maintainable infrastructure that grows with your needs.

## **Example Code**
- Since this was just meant to be outlining structure, I've pointed out key points. I will share example snippets in the relative topics like gitops workflow, testing or observability driven platform development concepts.

## **References**
- [Organazing Pulumi Projects & Stacks](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks)
- [Organizational Infra Repo Pattern](https://www.pulumi.com/blog/organizational-patterns-infra-repo/)

- [Structuring IaC](https://leebriggs.co.uk/blog/2023/08/17/structuring-iac)
- [Another Example Structure of IaC](https://maheshchandraregmi.com.np/structuring-infrastructure-as-code-with-a-layered-approach)

[Back to Workshop](../../README.md)

