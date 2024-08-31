package table

import (
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func CreateTable(ctx *pulumi.Context) (*dynamodb.Table, error) {
	dynamodbTable, err := dynamodb.NewTable(ctx, "basic-dynamodb-table", &dynamodb.TableArgs{
		Name:        pulumi.String("testdb"),
		BillingMode: pulumi.String("PROVISIONED"),
		HashKey:     pulumi.String("UserId"),
		Attributes: dynamodb.TableAttributeArray{
			&dynamodb.TableAttributeArgs{
				Name: pulumi.String("UserId"),
				Type: pulumi.String("S"),
			},
		},
	})

	if err != nil {
		return nil, err
	}

	return dynamodbTable, nil

}
