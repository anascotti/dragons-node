import SSM, { GetParameterResult } from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk/lib/core';

export default class SSMClient {
    ssm: SSM;

    constructor(region: string = 'eu-north-1') {
        this.ssm = new SSM({
            region: region
        });
    }

    getParameter = async (parameterName: string, decrypt:boolean = false): Promise<string> => {
        let getParamReq = {
            Name: parameterName, 
            WithDecryption: decrypt
           };
        return new Promise((resolve, reject) => {
            this.ssm.getParameter(getParamReq, (err: AWSError, result: GetParameterResult) => {
                if (err) { reject(err); }
                if (!result || !result.Parameter || !result.Parameter?.Value) {
                    reject(new Error('Empty result object'));
                } else {
                    resolve(result.Parameter.Value)
                }
            } );
        })   
    }
}


