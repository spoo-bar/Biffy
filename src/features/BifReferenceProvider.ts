import * as vscode from 'vscode'
import ITypeScriptServiceClient from '../typeScriptServiceClient'
import * as typeConverters from '../utils/typeConverters';
import * as Proto from '../protocol';
import * as fs from 'fs';
import * as path from 'path';

export default class BifReferenceProvider implements vscode.ReferenceProvider {

    public constructor(private readonly client: ITypeScriptServiceClient) { }

    public async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        options: { includeDeclaration: false },
        token: vscode.CancellationToken)
        : Promise<vscode.Location[]> {

        const filePath = this.client.toOpenedFilePath(document);
        if (!filePath) {
            return [];
        }

        const references = this.getReferences(filePath, position);
        const result: vscode.Location[] = [];
        for (const ref of references) {
            const url = this.client.toResource(ref.filePath);
            const location = typeConverters.Location.fromTextSpan(url, ref.location);
            result.push(location);
        }

        return result;
    }

    private getReferences(filePath: string, position: vscode.Position): Response[] {
        let data = fs.readFileSync(filePath, "utf-8");
        if(data) {
            let line = this.readLines(data)[position.line];
            let word = this.getGuidAt(line, position.character);
            if (word === "")
                return [];
            else {
                let folders = this.getAllFoldersInBIFSource("C:\\Code\\Git\\Katipo\\BIF-Source", []);
                let files = this.getBIFFiles(folders);
                return this.getFilesWithReference(files, word);
            }
        }
        return [];
    }

    private getFilesWithReference(files: string[], word: string): Response[] {
        let filesReference: Response[] = [];
        for (let file of files) {
            let data = fs.readFileSync(file, "utf-8");
            if(data) {
                if (data.includes(word)) {
                    data.split("\n").forEach(function (line, i) {
                        if (line.includes(word)) {
                            
                            let referenceLocation = new ReferenceLocation();
                            referenceLocation.start = new Location();
                            referenceLocation.start.line = i + 1;
                            referenceLocation.start.offset = line.indexOf(word);

                            referenceLocation.end = new Location();
                            referenceLocation.end.line = i + 1;
                            referenceLocation.end.offset = referenceLocation.start.offset + word.length;

                            let response = new Response();
                            response.filePath = file;
                            response.location = referenceLocation;
                            filesReference.push(response);
                        }
                    });
                }
            }
        }
        return filesReference;
    }

    private getBIFFiles(folders: string[]): string[] {
        let files: string[] = [];
        for (let folder of folders) {
            let filesInFolder: string[] = fs.readdirSync(folder).filter(file => fs.statSync(path.join(folder, file)).isFile())
            filesInFolder.forEach(file => {
                files.push(path.join(folder, file));
            });
        }
        return files;
    }

    private getAllFoldersInBIFSource(dir: string, folderList: string[]) {
        let folders: string[] = fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
        folders.forEach(folder => {
            if (!folder.startsWith(".")) {
                folderList.push(path.join(dir, folder));
                return this.getAllFoldersInBIFSource(path.join(dir, folder), folderList);
            }
        });
        return folderList;
    }

    private readLines(data: string): string[] {
        let lines: string[] = [];
        for (const a of data.split("\n")) {
            lines.push(a);
        }
        return lines;
    }

    private getGuidAt(data: string, position: number): string {
        if (data[position] == "\"") {
            position = position - 1;
        }

        if (position < 0 || position >= data.length - 1 || data[position] == "\"") {
            return "";
        }

        let guid = "";
        for (; position > 0 && data[position - 1] != "\""; position--) { }
        for (; position < data.length && data[position] != "\""; position++) {
            guid += data[position];
        }

        return this.checkGuidValidity(guid) ? guid : "";
    }

    private checkGuidValidity(guid: string): boolean {
        const pattern = new RegExp('^[0-9a-z]{8}-[0-9a-z]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-z]{12}$', 'i');
        return pattern.test(guid)
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
