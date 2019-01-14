import * as vscode from 'vscode';

export interface ITypeScriptServiceClient {
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
    toResource(filepath: string, document: vscode.TextDocument): vscode.Uri;
}
