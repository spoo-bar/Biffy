import * as uuid from 'uuid/v1';

export default class BifGenerateGuid {


    public getGuid(): string {
        const guid = uuid();
        return guid;
    }

}