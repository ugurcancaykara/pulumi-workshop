### Example directory hierachy


- **Note:** If you want to have a better understanding of how micro-stacks can be used, please read references after finish reading this `readme`.

In this pattern, your main infrastructure repository is made up of directories for each product/service that your teams use, in addition to directories for each higher level shared service. Each of these directories is itself a Pulumi program. So it would look something like this:

```
├── bluth-apps
│   ├── apps
│   │   ├── apps.go
│   │   ├── bananastand.go
│   │   ├── suddenvalley.go
│   ├── main.go
│   ├── Pulumi.dev.yaml
│   └── Pulumi.prod.yaml
├── datadog
│   ├── main.go
│   └── Pulumi.prod.yaml
├── github
│   ├── main.go
│   └── Pulumi.prod.yaml
├── pkg
│   ├── datadog
│   ├── pagerduty
│   └── vault
└── .etc
```

In the above example, the x Company has two main services that are used in all of its environments (“Banana Stand” and “Sudden Valley”). The main apps.go file is the entry point that simply calls functions from each of the various apps to “set up” those apps, as well as the common infrastructure that an environment might require (networks, storage, etc). Note that the way you structure your code is up to you, and likely will vary depending upon the runtime for your particular Pulumi program, but this is the general idea.

Similarly, the github and datadog directories are Pulumi programs that are responsible for the “core” infrastructure for those services (perhaps creating roles, etc). The pkg directory is a directory that contains packages that are used by the other programs to implement that infrastructure. Again, the pkg convention is used by Go, but other runtimes will have a similar approach.


### Examples
These examples are not complete runnable code, but used to illustrate the pattern. While these examples are using Go, they are written in a way that is compatible with any language that supports the Pulumi language.



Pulumi program which acts as entrypoint in `x-apps/main.go`
```go
package main

import (
    "github.com/bluthcompany/infra/bluth-apps/apps"
    "github.com/bluthcompany/infra/pkg/datadog"
    "github.com/bluthcompany/infra/pkg/github"
    "github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {
        // Create the apps.
       apps.SetupApps(ctx, bananastand, suddenvalley)

        // Create the infrastructure.
        datadog.CreateInfrastructure(ctx)
        github.CreateInfrastructure(ctx)

        return nil
    })
}
```

`x-apps/apps/apps.go`
```go
package apps
import (
    "github.com/pulumi/pulumi/sdk/go/pulumi"
)

func SetupApps(
    ctx *pulumi.Context,

    setupBananaStand(ctx)
    setupSuddenValley(ctx)

)
```

```go
package apps
// imports, etc
func setupBananaStand(ctx *pulumi.Context) {
    // Create the banana stand.
}
```


### Setting up a new service in the platform repository
If a service/product team has a new service they want infrastructure for, they simply add a new myapp.go file to the apps directory for their service, and add it to the apps.go file to make sure it is called. This is then submitted as a pull request for the platform team to review.

#### Use case: 
- You need ecr repositories for each application, so when service/product team has a new service they want required infra components for this service, you can implement it here.

One important part of this pattern is that the platform team does not want to be a “blocker” for the product and service teams. It’s key to make sure that you have more than one person able to review and merge these pull requests, and to add sufficient testing into your CI/CD pipeline for this infrastructure repository.



#### Variations on this pattern
In the example, there is one Pulumi program that is used regardless of environment, and the different configurations are handled by the use of stacks. However, there are situations where you might have complex enough differences between your environments where the amount of conditionals you require in your code to handle this would make for very challenging maintenance and understanding of the code! This is the case with GreenPark Sports, so in their implementation, instead of a single x-apps directory at the root of the repo, you would instead have x-prod, x-dev, etc.

This approach does generate duplication of code, and it can provide challenges at scale, but it is up to you and your teams to determine the tradeoffs of the branching/conditional logic vs separate programs.

**Check Pulumi ESC** and **Pulumi Config**
- I will add note here after checking above services so maybe we can prevent duplication of code



#### Conclusion
It is a pattern that facilitates collaboration between teams and focuses on having a central platform team that enables product teams, rather than getting in their way.



[Explaining Monolith stack to Micro-stacks](https://blog.bitsrc.io/managing-micro-stacks-using-pulumi-87053eeb8678)
- I think this medium blog will help you to understand difference between monolith and micro-stack architecture when it comes to Pulumi.
[Development of Composable Software for Infrastructure with Bit](https://blog.bitsrc.io/modern-infrastructure-as-code-iac-with-independent-bit-components-e1acfccdffeb)
- Can have a look, it's open-source and has enterprise features as well
    - It's kind of similar to Backstage, at some sense/level
