import * as vscode from 'vscode'

export default class BifReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        options: { includeDeclaration: false },
        token: vscode.CancellationToken)
        : Thenable<vscode.Location[]> {
            return null;
        }
}