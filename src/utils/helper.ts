import * as vscode from 'vscode'
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'node-powershell';
import * as vkbeautify from 'vkbeautify';

export default class Helper {

    public runMappingOnObject(assemblyFolderPath: string, bifSourcePath: string, objectId: string): Promise<string> {

        const setLocationCommand = 'Set-Location ' + assemblyFolderPath;
        const loadAssemblyCommand = 'Add-Type -Path "SI.Portal.BusinessIntegration.Definition.ObjectCore.dll"';
        const initializeFileServiceCommand = '[SI.Portal.BusinessIntegration.Definition.ObjectCore.FileService]:: Initialize("' + bifSourcePath + '", $null, $null)';
        const mapObjectCommand = 'Write-Output (New-Object -TypeName SI.Portal.BusinessIntegration.Definition.ObjectCore.MergeObject -ArgumentList @("' + objectId + '", $null, $true, $false)).MergedXml';

        let ps = new shell({
            debugMsg: false
        });
        const mappedObj = new Promise<string>(function (resolve, reject) {
            ps.addCommand(setLocationCommand).then(out => { });
            ps.invoke().then(output => {
                ps.addCommand(loadAssemblyCommand).then(out => { });
                ps.invoke().then(output => {
                    ps.addCommand(initializeFileServiceCommand).then(out => { });
                    ps.invoke().then(output => {
                        ps.addCommand(mapObjectCommand).then(out => { })
                        ps.invoke().then(output => {
                            resolve(vkbeautify.xml(output));
                        }).catch(err => {
                            ps.dispose();
                            reject(err);
                        });
                    }).catch(err => {
                        ps.dispose();
                        reject(err);
                    });
                }).catch(err => {
                    ps.dispose();
                    reject(err);
                })
            }).catch(err => {
                ps.dispose();
                reject(err);
            });
        });
        return mappedObj;
    }

    public getViewColumn(): vscode.ViewColumn {
        let mappedViewColumn = vscode.workspace.getConfiguration().get("conf.biffy.mappedViewColumn").toString();
        if (mappedViewColumn.toLowerCase() === "active") {
            return vscode.ViewColumn.Active;
        }
        return vscode.ViewColumn.Beside;
    }

    public getBIFSourcePath(): string {
        let bifSourcePath = vscode.workspace.getConfiguration().get("conf.biffy.bifSource");
        if (!bifSourcePath || bifSourcePath === "") {
            bifSourcePath = vscode.workspace.rootPath;
        }
        return bifSourcePath.toString();
    }

    public getMapperBinPath(): string {
        let binPath = vscode.workspace.getConfiguration().get("conf.biffy.mapperBinPath");
        if (!binPath || binPath.toString().length == 0) {
            throw Error("Bin path for mapper has not been configured.");
        }
        return binPath.toString();
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

    public getGuidAtPosition(data: string, position: number): string {
        let word: string = this.getWordBetween(data, position, "\"", "\""); // Word between double quotes
        if (!this.checkWordValidity(word)) { 
            word = this.getWordBetween(data, position, "(", ","); // Word between ( ,
        }

        return word;
    }

    public checkGuidValidity(guid: string): boolean {
        const pattern = new RegExp('^[0-9a-z]{8}-[0-9a-z]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-z]{12}$', 'i');
        return pattern.test(guid)
    }

    private getWordBetween(data: string, position: number, startsWith: string, endsWith: string): string {
        if (data[position] == startsWith) {
            position = position - 1;
        }
        if (position < 0 || position >= data.length - 1 || data[position] == endsWith) {
            return "";
        }

        let word = "";
        for (; position > 0 && data[position - 1] != startsWith; position--) { }
        for (; position < data.length && data[position] != endsWith; position++) {
            word += data[position];
        }

        return word;
    }

    private checkWordValidity(word: string): boolean {
        if (word.endsWith("\\r") || word.endsWith("\\n")) {
            return false;
        }
        const regex = /^[\w-]+$/gm;
        const match = regex.exec(word);
        if (match) {
            return true;
        }
        return false
    }
}