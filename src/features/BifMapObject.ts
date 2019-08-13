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

    public async mapReferenceFiles(currentDocument: vscode.TextDocument) {
        const fileName = currentDocument.fileName;
        this.mapBemlFiles(fileName);
    }

    public async getMappedObject(currentDocument: vscode.TextDocument) {

        const fileName = this.getFileName(currentDocument);
        const objectId = this.getObjectGuidFromFileName(fileName);
        if (objectId) {
            this.runMappingOnObject(objectId, true);
        }
        return null;
    }

    private mapBemlFiles(filePath: string) {
        let objectGuid = this.getObjectGuidFromFileName(filePath);
        if (objectGuid) {
            var referenceFiles = this.getReferences(filePath, objectGuid);
            const bxmlReferenceFiles = referenceFiles.filter(r => path.extname(r) === '.bxml');
            if (bxmlReferenceFiles.length > 0) {
                for (let reference of bxmlReferenceFiles) {
                    if (filePath.toUpperCase() !== reference.toUpperCase()) {
                        const bxmlGuid = this.getObjectGuidFromFileName(reference);
                        this.runMappingOnObject(bxmlGuid, false);
                        vscode.window.showInformationMessage("Mapped " + path.basename(reference));
                    }
                }
            }
            else {
                vscode.window.showWarningMessage("No bxml files refer to this beml file.");
            }

            if (this.helper.performRecursiveMapping()) {
                for (let reference of referenceFiles.filter(r => path.extname(r) === '.beml')) {
                    if (filePath.toUpperCase() !== reference.toUpperCase()) {
                        vscode.window.showInformationMessage("Mapping references of " + path.basename(reference));
                        this.mapBemlFiles(reference);
                    }
                }
            }
        }
    }

    private getReferences(filePath: string, objectGuid: string): string[] {
        let documentText = fs.readFileSync(filePath, "utf-8");
        if (documentText) {
            if (this.helper.checkGuidValidity(objectGuid)) {
                let bifSourcePath = this.helper.getBIFSourcePath();
                let folders = this.helper.getAllFoldersInBIFSource(bifSourcePath, []);
                let files = this.helper.getBIFFiles(folders);
                return this.getFilesWithReference(files, objectGuid);
            }
            else {
                vscode.window.showErrorMessage("Could not run mapping on the current file. It doesn't seem to have a valid guid ID");
            }
        }
        return [];
    }

    private getFilesWithReference(files: string[], word: string): string[] {
        let filesReference: string[] = [];
        for (let file of files) {
            let data = fs.readFileSync(file, "utf-8");
            if (data) {
                if (data.includes(word)) {
                    data.split("\n").forEach(function (line, i) {
                        if (line.includes(word)) {
                            filesReference.push(file);
                        }
                    });
                }
            }
        }
        return filesReference;
    }

    private runMappingOnObject(objectId: string, showMappedFile: boolean) {
        this.helper.runMappingOnObject(this.assemblyPath, this.bifSourcePath, objectId)
            .then(mappedText => {
                if (mappedText) {
                    if (showMappedFile) {
                        let mappedTextGuid = this.getObjectGuidFromText(mappedText.split('\n', 1)[0]);
                        if (mappedTextGuid) {
                            let mappedFileName = this.getMappedFileName(mappedTextGuid);
                            let mappedDocument = vscode.workspace.openTextDocument(mappedFileName);
                            mappedDocument.then((doc) => {
                                let edit = new vscode.WorkspaceEdit();
                                edit.insert(this.client.toResource(mappedFileName, doc), new vscode.Position(0, 0), mappedText);
                                vscode.workspace.applyEdit(edit).then((success) => {
                                    vscode.window.showInformationMessage("Successfully mapped " + path.basename(mappedFileName));
                                    vscode.window.showTextDocument(doc, this.getMappedViewColumn(), false);
                                });
                            });
                        }
                    }
                    else {
                        const filePath = path.join(this.bifSourcePath, 'mapped', objectId + '.xml');
                        fs.writeFileSync(filePath, mappedText);
                    }
                }
            });
    }

    private getMappedViewColumn(): vscode.ViewColumn {
        return this.helper.getViewColumn();
    }

    public getFileName(document: vscode.TextDocument): string {
        return path.basename(document.fileName);
    }

    public openMappedFile(mappedId: string) {
        if (this.helper.checkGuidValidity(mappedId)) {
            var mappedFolderPath = path.join(this.bifSourcePath, "mapped");
            if (fs.existsSync(mappedFolderPath)) {
                let file = fs.readdirSync(mappedFolderPath).filter(file => fs.statSync(path.join(mappedFolderPath, file)).isFile()).find(file => file.startsWith(mappedId));
                if (file) {
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

    private isBXMLFile(mappedFileName): boolean {
        var ext = mappedFileName.substr(mappedFileName.lastIndexOf('.') + 1);
        if (ext === "bxml") {
            return true;
        }
        return false;
    }

    private getMappedFileName(mappingGuid: string): string {
        let folders = this.helper.getAllFoldersInBIFSource(this.bifSourcePath, []);
        let files = this.helper.getBIFFiles(folders);

        for (let file of files) {
            if (file.indexOf(mappingGuid) > -1) {
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
        const pattern = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gm;
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