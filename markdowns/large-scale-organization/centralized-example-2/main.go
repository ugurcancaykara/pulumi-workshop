package main

import (
	"centralized-example-2/table"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create an AWS resource (DynamoDB Table)
		table, err := table.CreateTable(ctx)
		if err != nil {
			return err
		}

		ctx.Export("testTableArn", table.Arn)
		ctx.Export("testTableName", table.Name)

		return nil
	})
}
