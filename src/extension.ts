import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify, toUSVString } from 'util';
import * as path from 'path';
import { MessageProvider } from './messageProvider';

const execPromise = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    let commitMessage: string;
    const messageProvider = new MessageProvider();
    vscode.window.registerTreeDataProvider('swiftcommitView', messageProvider);
    vscode.commands.registerCommand('swiftcommitView.copyMessageButton', () => {
        vscode.commands.executeCommand('swiftcommitView.copyToClipboard');
    })
    // messageProvider.getTreeItem.icon = new vscode.ThemeIcon('folder');
    

    let disposable_1 = vscode.commands.registerCommand('swiftcommit.generateMessage', async () => {
        commitMessage = '';
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

            

            
            try {
                // checks if there is no staged files
                const res = await execPromise('git diff --cached --name-only', {
                    cwd: workspaceFolder.uri.fsPath
                })
                if (!res.stdout) {
                    vscode.window.showInformationMessage('No staged files')
                    return;
                }
                // bandaid solution to check if there was no previous commits
                await execPromise('git log', {
                    cwd: workspaceFolder.uri.fsPath
                })
            } catch(error) {
                commitMessage = "initial commit";
                vscode.commands.executeCommand('swiftcommitView.copyToClipboard');
                messageProvider.setMessage(commitMessage);
                return;
            }

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
                //console.log('Diff:', diff);

                const scriptPath = path.join(__dirname, '../generate_commit_message.py');
                const escapedDiff = diff.replace(/"/g, '\\"');

                messageProvider.setMessage('Generating...');

                const { stdout: message, stderr: scriptError } = await execPromise(`python "${scriptPath}" "${escapedDiff}"`);

                if (scriptError) {
                    console.error('Error:', scriptError);
                    vscode.window.showErrorMessage(`Error generating commit message: ${scriptError}`);
                    return;
                }


                const cleanedMessage = message
                    .replace(/\s+/g, ' ')
                    .trim();

                //console.log('Generated Commit Message:', cleanedMessage);
                commitMessage = cleanedMessage;
                
                vscode.commands.executeCommand('swiftcommitView.copyToClipboard');

                messageProvider.setMessage(cleanedMessage);
            } else { 
                vscode.window.showInformationMessage('No changes to show.');
            }
        } catch (error) {
            console.error('Error fetching diff:', error);
            vscode.window.showErrorMessage(`Error fetching diff: ${error}`);
        }
    });
    let disposable_2 = vscode.commands.registerCommand('swiftcommitView.copyToClipboard', async () => {
        try {
            if (commitMessage) {
                await vscode.env.clipboard.writeText(commitMessage);
                vscode.window.showInformationMessage('Message copied to clipboard');
                return;
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to copy text: ' + error)
        }
    })

    context.subscriptions.push(disposable_1);
    context.subscriptions.push(disposable_2)
}
