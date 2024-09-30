import * as vscode from 'vscode';

export class MessageProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getMessage() {
        throw new Error('Method not implemented.');
    }
    private _message: string = '';

    private _onDidChangeTreeData: vscode.EventEmitter<void | null | undefined> = new vscode.EventEmitter<void | null | undefined>();
    readonly onDidChangeTreeData: vscode.Event<void | null | undefined> = this._onDidChangeTreeData.event;

    setMessage(message: string) {
        this._message = message;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element) {
            return [];
        } else {

            return [new vscode.TreeItem(this._message, vscode.TreeItemCollapsibleState.None)];
        }
    }
}