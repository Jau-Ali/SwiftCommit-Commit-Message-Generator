/*
 * This file is part of SwiftCommit.
 *
 * SwiftCommit is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SwiftCommit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SwiftCommit. If not, see <https://www.gnu.org/licenses/>.
 */

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