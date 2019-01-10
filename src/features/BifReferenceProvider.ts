import * as vscode from 'vscode'
import ITypeScriptServiceClient from '../typeScriptServiceClient'
import * as typeConverters from '../utils/typeConverters';
import * as Proto from '../protocol';
import * as fs from 'fs';
import * as path from 'path';
import { deepStrictEqual } from 'assert';
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

        const references = await this.getReferences(filePath, position);

        const result: vscode.Location[] = [];
        for (const ref of references) {
            if (!options.includeDeclaration) {
                continue;
            }

            const url = this.client.toResource(ref.filePath);
            const location = typeConverters.Location.fromTextSpan(url, ref.location);
            result.push(location);
        }

        return result;
    }

    private async getReferences(filePath: string, position: vscode.Position): Promise<Response[]> {

        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) throw err;
            let line = this.readLines(data)[position.line];
            let word = this.getGuidAt(line, position.character);
            if (word === "")
                return [];
            else {
                let folders = this.getAllFoldersInBIFSource("C:\\Code\\Git\\Katipo\\BIF-Source", []);
                let files = this.getBIFFiles(folders);
            }
        });
        return [];
    }

    private getFilesWithReference(files: string[]): string[] {

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

interface Response {
    filePath: string;
    location: Proto.TextSpan;
}