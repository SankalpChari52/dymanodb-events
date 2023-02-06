let AWS = require("aws-sdk");

const DEMO_TABLE  = process.env.demo_table_name;
const documentClient = new AWS.DynamoDB.DocumentClient({region:"<REGION HERE>"})
exports.handler = async (event: any, context: any, callback: any) => {

    let _body = JSON.parse(event.body);
    const response:boolean = await saveDataToTable(_body);

    if(response){
        return {
            statusCode: 200,
            body: JSON.stringify({"message":"data saved successfully"}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }else{
        return {
            statusCode: 403,
            body: JSON.stringify({"message":"some error occured"}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

}

const saveDataToTable = async (insertData: any) => {
    const params = {
        TableName: DEMO_TABLE,
        Item: {
            ...insertData,
            created: +Date.now(),
        }
    };

    try {
        await documentClient.put(params).promise();
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
} //function end