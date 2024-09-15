import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

function activate(context: vscode.ExtensionContext) {
    const extensionPath = context.extensionPath;
    const modelPath = path.join(extensionPath, 'swiftcommit_model');
    const tokenizerPath = path.join(extensionPath, 'swiftcommit_tokenizer');

    vscode.commands.registerCommand('swiftcommit.generateMessage', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active text editor found.');
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showInformationMessage('No workspace folder found.');
            return;
        }

        const diff = await getStagedDiff(workspaceFolder);
        const pythonScript = path.join(extensionPath, 'generate_commit_message.py');

        exec(`python ${pythonScript} --model ${modelPath} --tokenizer ${tokenizerPath} --diff "${diff}"`, (err: Error | null, stdout: string, stderr: string) => {
            if (err) {
                vscode.window.showErrorMessage(`Error generating commit message: ${stderr}`);
                return;
            }
            const message = stdout.trim();
            vscode.window.showInformationMessage(`Generated Commit Message: ${message}`);
        });
    });
}

function getStagedDiff(workspacePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const gitDiffCommand = `git diff --cached`;
        exec(gitDiffCommand, { cwd: workspacePath }, (err: Error | null, stdout: string, stderr: string) => {
            if (err) {
                reject(`Error getting staged diff: ${stderr}`);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

exports.activate = activate;
