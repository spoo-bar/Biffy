import * as vscode from 'vscode';
import * as path from 'path';
import * as vkbeautify from 'vkbeautify';

export default class BifDocumentFormatter implements vscode.DocumentFormattingEditProvider {

    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken)
        : vscode.ProviderResult<vscode.TextEdit[]> {

        const lastLine = document.lineAt(document.lineCount - 1);
        const documentRange = new vscode.Range(document.positionAt(0), lastLine.range.end);

        return this.provideDocumentRangeFormattingEdits(document, documentRange, options, token);
    }

    public provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken)
        : vscode.ProviderResult<vscode.TextEdit[]> {

        const fileExtension = path.extname(document.fileName);
        if (fileExtension.toLowerCase() === ".beml" || fileExtension.toLowerCase() === ".bxml") {
            let selectedText = document.getText(range);
            let formattedText = vkbeautify.xml(selectedText);
            return [vscode.TextEdit.replace(range, formattedText)];
        }
    }
}

