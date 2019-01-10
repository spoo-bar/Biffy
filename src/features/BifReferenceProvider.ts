import * as vscode from 'vscode'
import ITypeScriptServiceClient from '../typeScriptServiceClient'
import * as typeConverters from '../utils/typeConverters';
import * as Proto from '../protocol';

export default class BifReferenceProvider implements vscode.ReferenceProvider {

    public constructor (private readonly client: ITypeScriptServiceClient) {}

    public async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        options: { includeDeclaration: false },
        token: vscode.CancellationToken)
        : Promise<vscode.Location[]> {
            
            const filePath = this.client.toOpenedFilePath(document);            
            if(!filePath) {
                return [];
            }

            const args = typeConverters.Position.toFileLocationRequestArgs(filePath, position);
            const references = await this.getReferences(args);

            const result: vscode.Location[] = [];
            for (const ref of references) {
                if(!options.includeDeclaration) {
                    continue;
                }

                const url = this.client.toResource(ref.filePath);
                const location = typeConverters.Location.fromTextSpan(url, ref.location);
                result.push(location);
            }

            return result;
        }

    private async getReferences(args: Proto.FileLocationRequestArgs): Promise<Response[]>{
        return [];
    }
}

interface Response {
    filePath: string;
    location: Proto.TextSpan;
}