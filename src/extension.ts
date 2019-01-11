'use strict';

import * as vscode from 'vscode'
import BifDefinitionProvider from './features/BifDefinitionProvider';
import BifReferenceProvider from './features/BifReferenceProvider'
import TypeScriptServiceClient from './typeScriptServiceClient'
import BifDocumentFormatter from './features/BifDocumentFormatter';

export function activate(context: vscode.ExtensionContext) : void {

    //Enables Find All References and Peek Reference
    context.subscriptions.push(vscode.languages.registerReferenceProvider(
        {language: "bif"}, new BifReferenceProvider(new TypeScriptServiceClient())
    ));

    //Enables Go to Definition and Peek Definition
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(
        {language: "bif"}, new BifDefinitionProvider(new TypeScriptServiceClient())
    ));

    //Enables Format Document
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
        {language: "bif"}, new BifDocumentFormatter()
    ));

    //Enables Formatting specific lines in document
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(
        {language: "bif"}, new BifDocumentFormatter()
    ));
}

