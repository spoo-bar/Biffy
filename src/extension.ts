'use strict';

import * as vscode from 'vscode'
import BifDefinitionProvider from './features/BifDefinitionProvider';
import BifReferenceProvider from './features/BifReferenceProvider'
import TypeScriptServiceClient from './typeScriptServiceClient'
import BifDocumentFormatter from './features/BifDocumentFormatter';
import BifMapObject from './features/BifMapObject';
import BifGenerateGuid from './features/BifGenerateGuid';
import * as path from 'path';
import Helper from './utils/helper';

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
    const bifMapObject = new BifMapObject(new TypeScriptServiceClient());
    const helper = new Helper();
    vscode.commands.registerCommand('biffy.mapObject', async () => {
        if (vscode.window.activeTextEditor) {
            const fileName = bifMapObject.getFileName(vscode.window.activeTextEditor.document);
            let outputChannel = helper.getConsoleOutputChannel();
            outputChannel.appendLine("Started mapping - " + fileName);
            bifMapObject.getMappedObject(vscode.window.activeTextEditor.document, true, outputChannel).then(out => {
            }).catch(err => {
                vscode.window.showErrorMessage(err);
            });

        }
    });

    //Map a beml file
    vscode.commands.registerCommand('biffy.mapReferenceObjects', async () => {
        const fileName = bifMapObject.getFileName(vscode.window.activeTextEditor.document);
        let outputChannel = helper.getConsoleOutputChannel();
        outputChannel.appendLine("Started mapping - " + fileName);
        outputChannel.show();
        bifMapObject.mapReferenceFiles(vscode.window.activeTextEditor.document, outputChannel)
    });

    //Generate GUID
    vscode.commands.registerCommand('biffy.generateGuid', async () => {
        if (vscode.window.activeTextEditor) {
            const bifGenerateGuid = new BifGenerateGuid();
            const guid = bifGenerateGuid.getGuid();
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(guid));
        }
    });

    vscode.commands.registerCommand('biffy.openMappedFile', async () => {
        vscode.window.showInputBox({ prompt: "Which mapped file to open ?" }).then(value => {
            bifMapObject.openMappedFile(value);
        });
    });

    vscode.workspace.onDidSaveTextDocument((textDocument) => {
        if (helper.autoMappingOnSave()) {
            if (textDocument.languageId == "bif") {
                let outputChannel = helper.getConsoleOutputChannel();
                bifMapObject.getMappedObject(vscode.window.activeTextEditor.document, false, outputChannel).then(out => {
                }).catch(err => {
                    vscode.window.showErrorMessage(err);
                });
            }
        }
    });
}
