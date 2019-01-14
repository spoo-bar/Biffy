import * as vscode from 'vscode'
import * as path from 'path'
import Helper from '../utils/helper';


export default class BifMapObject {

    private helper: Helper;
    private bifSourcePath: string;
    private assemblyPath: string;

    public constructor() {
        this.helper = new Helper();
        this.bifSourcePath = this.helper.getBIFSourcePath();
        this.assemblyPath = this.helper.getMapperBinPath();
    }

    public async getMappedObject(currentDocument: vscode.TextDocument): Promise<string> {
        
        const fileName = path.basename(currentDocument.fileName);
        const objectId = this.getObjectGuid(fileName);
        if (objectId) {
            return this.helper.runMappingOnObject(this.assemblyPath, this.bifSourcePath, objectId);
        }
        return null;
    }

    private getObjectGuid(fileName: string): string {
        const fileNameSplit = fileName.split(".");
        if (fileNameSplit) {
            if (this.helper.checkGuidValidity(fileNameSplit[0])) {
                return fileNameSplit[0];
            }
            else if (this.helper.checkGuidValidity(fileNameSplit[1])) {
                return fileNameSplit[1];
            }
            else if (this.helper.checkGuidValidity(fileNameSplit[2])) {
                return fileNameSplit[2];
            }
        }
    }

}