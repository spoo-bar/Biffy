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
            const url = this.client.toResource(reference.filePath);
            const location: vscode.Location = typeConverters.Location.fromTextSpan(url, reference.location);
            return location;
        }
    }

    private getReference(document: vscode.TextDocument, position: vscode.Position): Response {
        let data = document.getText();
        if (data) {
            let line = this.helper.readLines(data)[position.line];
            let word = this.helper.getGuidAt(line, position.character);
            if (word !== "") {
                let bifSourcePath = this.helper.getBIFSourcePath();
                let folders = this.helper.getAllFoldersInBIFSource(bifSourcePath, []);
                let files = this.helper.getBIFFiles(folders);
                return this.getFileWithReference(files, word);
            }
        }
    }

    private getFileWithReference(files: string[], word: string): Response {
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
                                referenceLocation.start.offset = line.indexOf(word);

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
