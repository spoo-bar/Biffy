import * as vscode from 'vscode'
import ITypeScriptServiceClient from '../typeScriptServiceClient'
import * as typeConverters from '../utils/typeConverters';
import * as Proto from '../utils/protocol';
import * as fs from 'fs';
import Helper from '../utils/helper';

export default class BifDefinitionProvider implements vscode.DefinitionProvider {

    private helper: Helper;

    public constructor(private readonly client: ITypeScriptServiceClient) {
        this.helper = new Helper();
    }

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken)
        : Promise<vscode.Location> {

        const reference = this.getReference(document, position);
        if (reference) {
            const url = this.client.toResource(reference.filePath, document);
            const location: vscode.Location = typeConverters.Location.fromTextSpan(url, reference.location);
            return location;
        }
    }

    private getReference(document: vscode.TextDocument, position: vscode.Position): Response {
        let data = document.getText();
        if (data) {
            let line = this.helper.readLines(data)[position.line];
            let guid = this.helper.getGuidAtPosition(line, position.character);

            if (this.helper.checkGuidValidity(guid)) {
                let bifSourcePath = this.helper.getBIFSourcePath();
                let folders = this.helper.getAllFoldersInBIFSource(bifSourcePath, []);
                let files = this.helper.getBIFFiles(folders);
                return this.getFileWithGuidReference(files, guid);
            } 
            else {
                let word = document.getText(document.getWordRangeAtPosition(position));
                return this.getPositionWithWordReference(data, word, this.client.toOpenedFilePath(document));
            }
        }
    }

    private getPositionWithWordReference(data: string, word: string, filePath: string): Response {
        let positionReference: Response;
        if (data.includes(word)) {
            data.split("\n").forEach(function (line, i) {
                if (line.includes(word)) {
                    if (line.includes('id="' + word + '"')) {
                        let referenceLocation = new ReferenceLocation();
                        referenceLocation.start = new Location();
                        referenceLocation.start.line = i + 1;
                        referenceLocation.start.offset = line.indexOf(word) + 1;

                        referenceLocation.end = new Location();
                        referenceLocation.end.line = i + 1;
                        referenceLocation.end.offset = referenceLocation.start.offset + word.length;

                        positionReference = new Response();
                        positionReference.filePath = filePath;
                        positionReference.location = referenceLocation;
                        return;
                    }
                }
            });
        }
        return positionReference;
    }

    private getFileWithGuidReference(files: string[], word: string): Response {
        let fileReference: Response;
        for (let file of files) {
            let data = fs.readFileSync(file, "utf-8");
            if (data) {
                if (data.includes(word)) {
                    data.split("\n").forEach(function (line, i) {
                        if (line.includes(word)) {
                            if (i == 0) {
                                let referenceLocation = new ReferenceLocation();
                                referenceLocation.start = new Location();
                                referenceLocation.start.line = i + 1;
                                referenceLocation.start.offset = line.indexOf(word) + 1;

                                referenceLocation.end = new Location();
                                referenceLocation.end.line = i + 1;
                                referenceLocation.end.offset = referenceLocation.start.offset + word.length;

                                fileReference = new Response();
                                fileReference.filePath = file;
                                fileReference.location = referenceLocation;
                                return;
                            }
                        }
                    });
                }
            }
        }
        return fileReference;
    }
}

class Response {
    filePath: string;
    location: Proto.TextSpan;
}

class ReferenceLocation implements Proto.TextSpan {
    start: Proto.Location;
    end: Proto.Location;
}

class Location implements Proto.Location {
    line: number;
    offset: number;
}
