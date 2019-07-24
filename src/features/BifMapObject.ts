import * as vscode from 'vscode'
import * as path from 'path';
import * as fs from 'fs';
import Helper from '../utils/helper';
import { ITypeScriptServiceClient } from '../ITypeScriptServiceClient';


export default class BifMapObject {

    private helper: Helper;
    private bifSourcePath: string;
    private assemblyPath: string;

    public constructor(private readonly client: ITypeScriptServiceClient) {
        this.helper = new Helper();
        this.bifSourcePath = this.helper.getBIFSourcePath();
        this.assemblyPath = this.helper.getMapperBinPath();
    }

    public async getMappedObject(currentDocument: vscode.TextDocument) {

        const fileName = this.getFileName(currentDocument);
        const objectId = this.getObjectGuidFromFileName(fileName);
        if (objectId) {
            this.helper.runMappingOnObject(this.assemblyPath, this.bifSourcePath, objectId)
                .then(mappedText => {
                    if (mappedText) {
                        let mappedTextGuid = this.getObjectGuidFromText(mappedText.split('\n', 1)[0]);
                        if (mappedTextGuid) {
                            let mappedFileName = this.getMappedFileName(mappedTextGuid);
                            if(this.isBXMLFile(mappedFileName)) {
                                let mappedDocument = vscode.workspace.openTextDocument(mappedFileName);
                                mappedDocument.then( (doc) => {
                                    let edit = new vscode.WorkspaceEdit();
                                    edit.insert(this.client.toResource(mappedFileName, doc), new vscode.Position(0,0), mappedText);
                                    vscode.workspace.applyEdit(edit).then((success) => {
                                        vscode.window.showTextDocument(doc, this.getMappedViewColumn(), false);
                                    })
                                });
                            }
                            else this.openAsUntitled(mappedText);
                        }
                        else this.openAsUntitled(mappedText);
                    }
                });
        }
        return null;
    }

    public getMappedViewColumn(): vscode.ViewColumn {
        return this.helper.getViewColumn();
    }

    public getFileName(document: vscode.TextDocument): string {
        return path.basename(document.fileName);
    }

    public openMappedFile(mappedId : string) {
        if(this.helper.checkGuidValidity(mappedId)) {
            var mappedFolderPath = path.join(this.bifSourcePath, "mapped");
            if(fs.existsSync(mappedFolderPath)) {
                let file = fs.readdirSync(mappedFolderPath).filter(file => fs.statSync(path.join(mappedFolderPath, file)).isFile()).find(file => file.startsWith(mappedId));
                if(file) {
                    var filePath = path.join(mappedFolderPath, file);
                    vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(document => {
                        vscode.window.showTextDocument(document).then();
                    });
                }
                else {
                    vscode.window.showErrorMessage("File not found in mapped folder : " + mappedId + ".bxml");
                }
            }
            else {
                vscode.window.showErrorMessage("Mapped folder doesn't exist at " + mappedFolderPath);
            }
        }
        else {
            vscode.window.showErrorMessage("Input wasnt a valid guid");
        }
    }

    private isBXMLFile(mappedFileName) : boolean {
        var ext = mappedFileName.substr(mappedFileName.lastIndexOf('.') + 1);
        if(ext === "bxml") {
            return true;
        }
        return false;
    }
    
    private getMappedFileName(mappingGuid: string): string {
        let folders = this.helper.getAllFoldersInBIFSource(this.bifSourcePath, []);
        let files = this.helper.getBIFFiles(folders);

        for(let file of files) {
            if(file.indexOf(mappingGuid) > -1) {
                return file;
            }
        }
    }

    private openAsUntitled(text: string): void {
        const document = vscode.workspace.openTextDocument({ language: "bif", content: text });
        document.then(doc => {
            vscode.window.showTextDocument(doc, this.getMappedViewColumn(), false);
        })
    }

    private getObjectGuidFromText(text: string): string {
        const pattern =  /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gm;
        let match = pattern.exec(text);
        return match ? match[0] : null;
    }

    private getObjectGuidFromFileName(fileName: string): string {
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