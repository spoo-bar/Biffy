import * as vscode from 'vscode';
import { ITypeScriptServiceClient } from './ITypeScriptServiceClient';

export default class TypeScriptServiceClient implements ITypeScriptServiceClient {

    private pathSeparator: string = "\\";

    public normalizedPath(resource: vscode.Uri): string | undefined {
        const result = resource.fsPath;
        if (!result) {
            return undefined;
        }

        // Both \ and / must be escaped in regular expressions
        return result.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/');
    }

    public toPath(resource: vscode.Uri): string | undefined {
        return this.normalizedPath(resource);
    }

    public toOpenedFilePath(document: vscode.TextDocument): string | undefined {
        // TODO : Handle large files 
        return this.toPath(document.uri) || undefined;
    }

    public toResource(filepath: string): vscode.Uri {
        let resource = vscode.Uri.file(filepath);
        return resource;
    }
}
