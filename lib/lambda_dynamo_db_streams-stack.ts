import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import * as DynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const SENDGRID_API_KEY = "<API KEY HERE>";

export class LambdaDynamoDbStreamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const table = new DynamoDB.Table(this,"events-table",{
      partitionKey:{
        name:"PK",
        type:DynamoDB.AttributeType.STRING
      },
      sortKey:{
        name:"SK",
        type:DynamoDB.AttributeType.NUMBER
      },
      tableName:"Events-table",
      stream:DynamoDB.StreamViewType.NEW_IMAGE
    })

  const saveData = new Lambda.Function(this,"handledata",{
      functionName:"demo-handledata",
      runtime:Lambda.Runtime.NODEJS_14_X,
      code:Lambda.Code.fromAsset("Lambda/save-data"),
      retryAttempts:2,
      timeout:cdk.Duration.seconds(60),
      handler:"index.handler",
      environment: {
        'demo_table_name': table.tableName,
      },
   })
   table.grantReadWriteData(saveData);


   const sendEmail = new Lambda.Function(this,"send-email",{
      functionName:"demo-send-email",
      runtime:Lambda.Runtime.NODEJS_14_X,
      code:Lambda.Code.fromAsset("Lambda/send-email"),
      retryAttempts:2,
      timeout:cdk.Duration.seconds(60),
      handler:"index.handler",
      environment: {
        'demo_table_name': table.tableName,
        "SENDGRID_API_KEY":SENDGRID_API_KEY
      },
  })

  
  sendEmail.addEventSource(new DynamoEventSource(table,{
    startingPosition: Lambda.StartingPosition.LATEST,
    retryAttempts:2,
    batchSize:10
  }))

   const api = new ApiGateway.LambdaRestApi(this,"demo-api",{
     proxy:false,
     handler:saveData
   })
   api.root.addMethod("POST");
  }
}
