'use strict';

import * as vscode from 'vscode'
import BifDefinitionProvider from './features/BifDefinitionProvider';
import BifReferenceProvider from './features/BifReferenceProvider'
import TypeScriptServiceClient from './typeScriptServiceClient'
import BifDocumentFormatter from './features/BifDocumentFormatter';
import BifMapObject from './features/BifMapObject';
import BifGenerateGuid from './features/BifGenerateGuid';

export function activate(context: vscode.ExtensionContext): void {

    //Enables Find All References and Peek Reference
    context.subscriptions.push(vscode.languages.registerReferenceProvider(
        { language: "bif" }, new BifReferenceProvider(new TypeScriptServiceClient())
    ));

    //Enables Go to Definition and Peek Definition
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(
        { language: "bif" }, new BifDefinitionProvider(new TypeScriptServiceClient())
    ));

    //Enables Format Document
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
        { language: "bif" }, new BifDocumentFormatter()
    ));

    //Enables Formatting specific lines in document
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(
        { language: "bif" }, new BifDocumentFormatter()
    ));

    //Fetch mapped object
    vscode.commands.registerCommand('biffy.mapObject', async () => {
        if (vscode.window.activeTextEditor) {
            const bifMapObject = new BifMapObject();
            vscode.window.setStatusBarMessage("Mapping " + bifMapObject.getFileName(vscode.window.activeTextEditor.document), 2000);            
            bifMapObject.getMappedObject(vscode.window.activeTextEditor.document).then(out => {
                if(out) {
                    const document = vscode.workspace.openTextDocument({ language: "bif", content: out});
                    document.then(doc => {
                        vscode.window.showTextDocument(doc, bifMapObject.getMappedViewColumn(), false);
                    })
                };
            }).catch(err => {
                vscode.window.showErrorMessage(err);
            });
            
        }
    });

    //Generate GUID
    vscode.commands.registerCommand('biffy.generateGuid', async () => {
        if(vscode.window.activeTextEditor) {
            const bifGenerateGuid = new BifGenerateGuid();
            const guid = bifGenerateGuid.getGuid();
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(guid));
        }
    });
}
