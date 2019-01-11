import * as vscode from 'vscode'
import * as fs from 'fs';
import * as path from 'path';

export default class Helper {

    public getBIFSourcePath(): string {
        let bifSourcePath = vscode.workspace.getConfiguration().get("conf.biffy.bifSource");
        if(!bifSourcePath || bifSourcePath === ""){
            bifSourcePath = vscode.workspace.rootPath;
        }
        return bifSourcePath.toString();
    }

    
    public getBIFFiles(folders: string[]): string[] {
        let files: string[] = [];
        for (let folder of folders) {
            let filesInFolder: string[] = fs.readdirSync(folder).filter(file => fs.statSync(path.join(folder, file)).isFile())
            filesInFolder.forEach(file => {
                files.push(path.join(folder, file));
            });
        }
        return files;
    }

    public getAllFoldersInBIFSource(dir: string, folderList: string[]) {
        let folders: string[] = fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
        folders.forEach(folder => {
            if (!folder.startsWith(".")) {
                folderList.push(path.join(dir, folder));
                return this.getAllFoldersInBIFSource(path.join(dir, folder), folderList);
            }
        });
        return folderList;
    }

    public readLines(data: string): string[] {
        let lines: string[] = [];
        for (const line of data.split("\n")) {
            lines.push(line);
        }
        return lines;
    }

    public getGuidAt(data: string, position: number): string {
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

    public checkGuidValidity(guid: string): boolean {
        const pattern = new RegExp('^[0-9a-z]{8}-[0-9a-z]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-z]{12}$', 'i');
        return pattern.test(guid)
    }

}