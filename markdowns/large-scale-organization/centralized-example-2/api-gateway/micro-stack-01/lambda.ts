import * as AWS from "aws-sdk";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { v4 as uuidv4 } from 'uuid';
import { testTable } from "../index";

const config = new pulumi.Config();
const env = config.require("env");

export const createNote = new aws.lambda.CallbackFunction(`${env}-create-note`, {  // Updated to use hyphens
	callback: async (event: any, context): Promise<any> => {
		const documentClient = new AWS.DynamoDB.DocumentClient();
		const { title, body } = JSON.parse(event.body as string);
		const noteId = uuidv4();

		return testTable.apply(async tableName => {
			const note = {
				id: noteId,
				title,
				body,
			};

			await documentClient.put({
				TableName: tableName,
				Item: note,
			}).promise();

			return {
				statusCode: 200,
				body: JSON.stringify(note),
			};
		});
	}
});


