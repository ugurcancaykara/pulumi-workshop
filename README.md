# **IaC with Pulumi**

## **Goal**

The goal of this workshop is to assess how mature the infrastructure as code (IaC) setup can be when using Pulumi.

## **Target Audience**

This workshop is intended for DevOps engineers, cloud architects, and developers who are familiar with infrastructure as code concepts and are looking to explore or deepen their understanding of Pulumi.

## **Scope**

Focus on Pulumi's capabilities in managing cloud infrastructure specifically within AWS. It will explore best practices for project structuring, testing, and deployment processes, with an emphasis on creating a robust and scalable mature infrastructure. Throughout the guides, detailed markdown references will be provided to external links alongside the code examples.

## **Background**

Over the past few years, I've worked extensively with Terraform and Terragrunt to orchestrate infrastructure as code (IaC). This involved organizing modules, using composition root modules, managing versioning, and employing pull request-based GitOps workflows.

Now, you might be wondering, what's the goal here? Why am I writing this? Well, even though I use Terraform quite a bit for a while, I've found that its limitations as a DSL can be frustrating. But don't take this as a negative comment. Terraform is designed in such a way that the learning curve is short, so I could quickly start integrating it into my flow. So simplicity, maturity, low learning curve. Plus, with a large and active community, I never really felt alone when running into issues. This is not an attempt to criticize Terraform, but most of my experience is with Terraform and Terragrunt structures. I want to clarify that others might use these tools differently, and the limitations I perceive might be addressed in newer versions of Terraform (for instance, native testing functionality introduced after version 1.6.0, which I don't prefer to use to due to licensing(BUSL)). Therefore, my comparison will be based on my own experience.

So, my intention isn't to say "use Pulumi instead of Terraform," but rather to explore how Pulumi could offer some win-win scenarios in the long run for individual projects, team efforts, or delivering high-quality services.

I also believe that simply choosing a tool based on reading documentation or browsing through Reddit discussions isn't the best approach. That's why it's time to roll up my sleeves, understand the tool's holistic operation, delve into why some people had bad experiences with it, and put it to the test.

## **Critical Considerations**

To manage IaC in a production-grade and mature way, there are several critical considerations I keep in mind when deciding to try out a new tool, I will share my insights of below given captions within an outline as follows-> Background, Timeline, Description, Comments and Snippets, Conclusion, References.

## **1. Tool Maturity**

- **Tool Maturity**
- **Documentation Quality**


[See Details](markdowns/tool-maturity/tool-maturity.md)

## **2. Pulumi Internals**
- Projects
- Stacks
- Configuration
- ESC
- ApplyT
- Get funcs


## **3. Large-Scale Project Organization**

- **Scalability**
- **Tool Integration**

[See Details](markdowns/large-scale-organization/large-scale-organization.md)



## **4. Testing**

- **Unit Tests**
- **Property Tests**
- **Integration Tests**


[See Details](markdowns/testing/testing.md)



## **5. GitOps Workflow Integration**

- **GitOps Practices**
- **Promotion and Versioning**
- **Automated Rollbacks**

[See Details](markdowns/cicd/gitops-integration.md)


## **6. Platform Release Management**

- **How to apply versioning at pulumi**
- **Resource Management**
- **Drift Management**
- **Rollbacks**

[See Details](markdowns/release-management/release-management.md)


## **7. Extending Pulumi to some useful concepts**

- **Observability**
- **Cost Optimization**
- **Policy Enforcement**

[See Details](markdowns/extending-pulumi/extensibility.md)

## **8.Observability Driven Platform Development**
- **Extending Pulumi**
- **Observing infrastructure development**

[See Details](markdowns/odpd/odpd.md)

## **9.Pulumi Cloud vs. Custom State Backend**
- **Debate on pulumi cloud features that are free and not free**
- **Deciding which one to use at which type of customers, businesses etc.**

[See Details](markdowns/pulumicloud/pulumi-cloud.md)

## **10.Environment Discovery(IDP)**
- Integration with backstage
- Tracking the deployed resources
- Discovering package ownerships
- Self-service via code and UI(e.g Software templates at backstage)
- Integrating with policies to prevent unwanted resource creations
- Learning about composable Infrasturcture

[See Details](markdowns/idp/idp.md)


## **11. Team Adoption**

- **Team Adaptability**
- **Team Training**

[See Details](markdowns/team-adoption/team-adoption.md)



## **Conclusion**

While it's ambitious to find a single tool that addresses all these aspects perfectly, I believe Pulumi offers a promising solution that combines many of the desired features. In this workshop, I'll explore these categories in depth, provide test code, share useful resources, and conclude with my personal reflections.

[See Details](markdowns/conclusion.md)
