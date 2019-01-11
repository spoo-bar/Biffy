'use strict';

import * as vscode from 'vscode'
import BifDefinitionProvider from './features/BifDefinitionProvider';
import BifReferenceProvider from './features/BifReferenceProvider'
import TypeScriptServiceClient from './typeScriptServiceClient'

export function activate(context: vscode.ExtensionContext) : void {

    //Enables Find All References and Peek Reference
    context.subscriptions.push(vscode.languages.registerReferenceProvider(
        {language: "bif"}, new BifReferenceProvider(new TypeScriptServiceClient())
    ));

    //Enables Go to Definition and Peek Definition
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(
        {language: "bif"}, new BifDefinitionProvider(new TypeScriptServiceClient())
    ));
}

