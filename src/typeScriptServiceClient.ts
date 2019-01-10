import * as vscode from 'vscode'

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
        // if (!this.bufferSyncSupport.handles(document.uri)) {
        // 	console.error(`Unexpected resource ${document.uri}`);
        // 	return undefined;
        // }
        return this.toPath(document.uri) || undefined;
    }

    public toResource(filepath: string): vscode.Uri {
        let resource = vscode.Uri.parse(filepath);
        // TODO more validation. buffer size. and file type etc
        return resource;
    }
}

interface ITypeScriptServiceClient {
	/**
	 * Convert a resource (VS Code) to a normalized path (TypeScript).
	 *
	 * Does not try handling case insensitivity.
	 */
    normalizedPath(resource: vscode.Uri): string | undefined;

	/**
	 * Map a resource to a normalized path
	 *
	 * This will attempt to handle case insensitivity.
	 */
    toPath(resource: vscode.Uri): string | undefined;

	/**
	 * Tries to ensure that a vscode document is open on the TS server.
	 *
	 * Returns the normalized path.
	 */
    toOpenedFilePath(document: vscode.TextDocument): string | undefined;

	/**
	 * Convert a path to a resource.
	 */
    toResource(filepath: string): vscode.Uri;
}
