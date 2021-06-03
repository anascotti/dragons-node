import S3 from 'aws-sdk/clients/s3';

export default class S3Client {
    bucketName: string;
    s3: S3;

    constructor(bucketName: string, region: string = 'eu-nort-1') {
        this.bucketName = bucketName;
        this.s3 = new S3({
            region: region
        });
    }
}