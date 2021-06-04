import { QueryStringParametersMap } from 'aws-sdk/clients/cloudwatchevents';
import S3 from 'aws-sdk/clients/s3';
import { ReadStream } from "fs";

export default class S3Client {
    bucketName: string;
    s3: S3;

    constructor(bucketName: string, region: string = 'eu-north-1') {
        this.bucketName = bucketName;
        this.s3 = new S3({
            region: region
        });
    }

    queryFile = async (bucketName: string, fileName: string, params: any = []) => {
        let expression = "select * from s3object s"

        if (params && params.dragonName && params.dragonName !== "")
            expression = "select * from S3Object[*][*] s where s.dragon_name_str =  '" + params['dragonName'] + "'"
        else if (params && params.family && params.family !== "")
            expression = "select * from S3Object[*][*] s where s.family_str =  '" + params['family'] + "'"

        let selectRequest = {
            Bucket: bucketName,
            Expression: expression,
            ExpressionType: 'SQL',
            Key: fileName,
            InputSerialization: {
                JSON: {
                    Type: 'DOCUMENT',
                }
            },
            OutputSerialization: {
                JSON: {
                    RecordDelimiter: ','
                }
            }
        }


        return new Promise((resolve, reject) => {
            this.s3.selectObjectContent(selectRequest, (err, data) => {
                if (err) { reject(err); }
                if (!data) {
                    reject('Empty data object');
                }

                let dataToReturn: string[] = [];

                const eventStream = data.Payload as ReadStream;
                eventStream.on('data', (event: { Records: { Payload: any; }; }) => {
                    if (event.Records) {
                        dataToReturn += event.Records.Payload.toString();
                    } else {
                        console.log("Event = " + JSON.stringify(event))
                    }
                });

                eventStream.on('error', (err: any) => {
                    reject(err);
                });

                eventStream.on('end', () => {
                    try {
                        resolve(JSON.stringify(dataToReturn));
                    } catch (e) {
                        reject(new Error(`Unable to convert S3 data to JSON object. S3 Select Query: ${params.Expression}`));
                    }
                });
            });
        })

    }

}