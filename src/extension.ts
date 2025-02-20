import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";
import { MessageProvider } from "./messageProvider";

const execPromise = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    let commitMessage: string = "";
    const messageProvider = new MessageProvider();
    vscode.window.registerTreeDataProvider("swiftcommitView", messageProvider);

    let disposableGenerate = vscode.commands.registerCommand("swiftcommit.generateMessage", async () => {
        commitMessage = "";
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        const fileUri = vscode.window.activeTextEditor?.document.uri;
        if (!fileUri) {
            vscode.window.showErrorMessage("No file is currently open.");
            return;
        }

        const filePath = fileUri.fsPath;

        try {
            const statusRes = await execPromise(`git diff --cached --name-only`, {
                cwd: workspaceFolder.uri.fsPath,
            });

            if (!statusRes.stdout.trim()) {
                vscode.window.showInformationMessage("No staged files detected.");
                return;
            }

            try {
                await execPromise("git log", {
                    cwd: workspaceFolder.uri.fsPath,
                });
            } catch (error) {
                commitMessage = "initial commit";
                messageProvider.setMessage(commitMessage);
                setSCMInputBox(commitMessage);
                return;
            }

            const { stdout: diff, stderr: diffError } = await execPromise(`git diff HEAD ${filePath}`, {
                cwd: workspaceFolder.uri.fsPath,
            });

            if (diffError) {
                console.error("Error:", diffError);
                vscode.window.showErrorMessage(`Error fetching diff: ${diffError}`);
                return;
            }

            if (diff.trim()) {
                messageProvider.setMessage("Generating...");

                //Write diff to a temp file with UTF-8 encoding
                const tempFilePath = path.join(workspaceFolder.uri.fsPath, "temp_diff.txt");
                fs.writeFileSync(tempFilePath, diff, "utf-8");

                //Run Python script with the temp file
                const scriptPath = path.join(__dirname, "../generate_commit_message.py");
                const { stdout: generatedMsg, stderr: scriptError } = await execPromise(`python "${scriptPath}" "${tempFilePath}"`);

                //Remove the temp file after use
                fs.unlinkSync(tempFilePath);

                if (scriptError) {
                    console.error("Script Error:", scriptError);
                    vscode.window.showErrorMessage(`Error generating commit message: ${scriptError}`);
                    return;
                }

                commitMessage = generatedMsg.replace(/\s+/g, " ").trim();
                messageProvider.setMessage(commitMessage);
                setSCMInputBox(commitMessage);

                vscode.window.showInformationMessage("Commit message generated!");
            } else {
                vscode.window.showInformationMessage("No changes to show.");
            }
        } catch (error) {
            console.error("Error fetching diff:", error);
            vscode.window.showErrorMessage(`Error fetching diff: ${error}`);
        }
    });

    let disposableCopy = vscode.commands.registerCommand("swiftcommitView.copyToClipboard", async () => {
        if (commitMessage) {
            try {
                await vscode.env.clipboard.writeText(commitMessage);
                vscode.window.showInformationMessage("Message copied to clipboard.");
            } catch (error) {
                vscode.window.showErrorMessage("Failed to copy text: " + error);
            }
        }
    });

    context.subscriptions.push(disposableGenerate, disposableCopy);
}

function setSCMInputBox(message: string) {
    const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
    const git = gitExtension?.getAPI(1);

    if (git && git.repositories.length > 0) {
        git.repositories[0].inputBox.value = message;
    } else {
        vscode.window.showErrorMessage("Git extension is not available or no repository found.");
    }
}
