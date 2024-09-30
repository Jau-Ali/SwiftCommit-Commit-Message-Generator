import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { MessageProvider } from './messageProvider';

const execPromise = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    const messageProvider = new MessageProvider();
    vscode.window.registerTreeDataProvider('swiftcommitView', messageProvider);

    let disposable = vscode.commands.registerCommand('swiftcommit.generateMessage', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const fileUri = vscode.window.activeTextEditor?.document.uri;
        if (!fileUri) {
            vscode.window.showErrorMessage('No file is currently open.');
            return;
        }

        const filePath = fileUri.fsPath;
        try {
            const { stdout, stderr } = await execPromise(`git diff HEAD ${filePath}`, {
                cwd: workspaceFolder.uri.fsPath
            });

            if (stderr) {
                console.error('Error:', stderr);
                vscode.window.showErrorMessage(`Error fetching diff: ${stderr}`);
                return;
            }

            const diff = stdout.trim();
            if (diff) {
                console.log('Diff:', diff);

                const scriptPath = path.join(__dirname, '../generate_commit_message.py');
                const escapedDiff = diff.replace(/"/g, '\\"');
                const { stdout: message, stderr: scriptError } = await execPromise(`python "${scriptPath}" "${escapedDiff}"`);

                if (scriptError) {
                    console.error('Error:', scriptError);
                    vscode.window.showErrorMessage(`Error generating commit message: ${scriptError}`);
                    return;
                }


                const cleanedMessage = message
                    .replace(/\s+/g, ' ')
                    .trim();

                console.log('Generated Commit Message:', cleanedMessage);


                messageProvider.setMessage(cleanedMessage);
            } else {
                vscode.window.showInformationMessage('No changes to show.');
            }
        } catch (error) {
            console.error('Error fetching diff:', error);
            vscode.window.showErrorMessage(`Error fetching diff: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}
