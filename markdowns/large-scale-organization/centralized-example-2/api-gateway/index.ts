import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as notes from "./micro-stack-01/lambda"

const config = new pulumi.Config();
const env = config.require("env");

// obtain the declared configs for the dev stack in api-gateway
const referrerProjectName = config.require("core-project-name");
const referrerOrganizationName = config.require("core-org");
const referrerStageName = config.require("core-stack");

const coreInfrastructureReference = new pulumi.StackReference(`${referrerOrganizationName}/${referrerProjectName}/${referrerStageName}`);

const api = new aws.apigateway.RestApi(`${env}-api-gateway`, {
	description: `API Gateway for ${env} environment`,
});

const notesResource = new aws.apigateway.Resource(`${env}-notes-resource`, {
	parentId: api.rootResourceId,
	pathPart: "notes",
	restApi: api.id,
});

// '/notes' -> Post method
const createMethod = new aws.apigateway.Method(`${env}-create-method`, {
	restApi: api.id,
	resourceId: notesResource.id,
	httpMethod: "POST",
	authorization: "NONE",
	requestParameters: {},
	requestModels: {},
	apiKeyRequired: false,
});

// Add invoke permissions for API Gateway to invoke the Lambda function
const lambdaInvokePermission = new aws.lambda.Permission(`${env}-invoke-permission`, {
	action: "lambda:InvokeFunction",
	function: notes.createNote.name,  // Lambda function name
	principal: "apigateway.amazonaws.com",
	sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,  // Allow API Gateway to invoke the function
});

// ...... More integration and resources
// Basically you can add your integrationg, and create a deployment of this api

// testTableName is the value exported from centralized-example-2 project
export const testTable = coreInfrastructureReference.getOutput("testTableName");

