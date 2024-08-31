package main

import (
	"github.com/ugurcancaykara/pulumi-workshop/markdowns/large-scale-organization-centralized-platform-infrastructure-repository/pkg/datadog"
	"github.com/ugurcancaykara/pulumi-workshop/markdowns/large-scale-organization-centralized-platform-infrastructure-repository/pkg/github"
	"github.com/ugurcancaykara/pulumi-workshop/markdowns/large-scale-organization-centralized-platform-infrastructure-repository/x-apps/apps"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {

		// Create the apps
		apps.SetupApps(ctx, bananastand, suddenvalley)

		// Create the infrastructure for these apps
		datadog.CreateInfrastructure(ctx)
		github.CreateInfrastructure(ctx)
		return nil
	})
}
