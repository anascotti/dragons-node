import S3Client from '../utils/s3';
import SSMClient from '../utils/ssm';

export const queryDragonsHandler = async ( event: any, context: any, callback: any): Promise<void> => {

    const ssmClient = new SSMClient();
    try {
        const bucketName: string =  await ssmClient.getParameter('dragon_data_bucket_name');
        const s3Client = new S3Client(bucketName);
        console.log('miew');

        await ssmClient.getParameter('dragon_data_file_name')
            .then( fileName => s3Client.queryFile(bucketName, fileName))
            .then( dragonData => {
                callback(null, {
                    "statusCode":200,
                    "body":dragonData})
                }
            )
    } catch (error) {
        console.log(error);
        callback(null, {
            "statusCode":500,
            "body": "Internal Server Error"}
        )
    }
}

queryDragonsHandler({}, {}, 
    function(err: any,response: any) {  //callback function with two arguments 
        console.log(response)
    })