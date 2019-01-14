import * as vscode from 'vscode'
import * as path from 'path'
import Helper from '../utils/helper';


export default class BifMapObject {

    private helper: Helper;
    public constructor() {
        this.helper = new Helper();
    }

    public async getMappedObject(currentDocument: vscode.TextDocument): Promise<vscode.TextDocument> {

        const fileName = path.basename(currentDocument.fileName);
        const objectGuid = this.getObjectGuid(fileName);
        if (objectGuid) {
            const mappedFilePath = path.join(this.helper.getBIFSourcePath(), "mapped", objectGuid + ".bxml");
            const mappedFile = await vscode.workspace.openTextDocument(mappedFilePath);
            return mappedFile;
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