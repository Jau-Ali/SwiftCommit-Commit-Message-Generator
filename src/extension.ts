import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";
import { MessageProvider } from "./messageProvider";

const execPromise = promisify(exec);

export async function activate(context: vscode.ExtensionContext) {
    let commitMessage: string = "";
    const messageProvider = new MessageProvider();
    vscode.window.registerTreeDataProvider("swiftcommitView", messageProvider);

    // Ensure dependencies are installed before use
    await ensureDependencies();

    let disposableGenerate = vscode.commands.registerCommand("swiftcommit.generateMessage", async () => {
        commitMessage = "";
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        try {
            // Get all staged diffs
            const { stdout: diff, stderr: diffError } = await execPromise(`git diff --cached`, {
                cwd: workspaceFolder.uri.fsPath,
            });

            if (diffError) {
                console.error("Error:", diffError);
                vscode.window.showErrorMessage(`Error fetching diff: ${diffError}`);
                return;
            }

            if (!diff.trim()) {
                vscode.window.showInformationMessage("No staged changes detected.");
                return;
            }

            messageProvider.setMessage("Generating...");

            // Write diff to a temp file
            const tempFilePath = path.join(workspaceFolder.uri.fsPath, "temp_diff.txt");
            fs.writeFileSync(tempFilePath, diff, "utf-8");

            // Run Python script with the temp file
            const scriptPath = path.join(__dirname, "../generate_commit_message.py");
            const pythonCmd = await getPythonCommand();
            const { stdout: generatedMsg, stderr: scriptError } = await execPromise(`${pythonCmd} "${scriptPath}" "${tempFilePath}"`);

            // Remove the temp file
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

/**
 * Ensures that required Python dependencies are installed.
 */
async function ensureDependencies() {
    try {
        const pythonCmd = await getPythonCommand();
        const { stdout } = await execPromise(`${pythonCmd} -m pip install transformers torch`);
        console.log(stdout);
        vscode.window.showInformationMessage("SwiftCommit: Dependencies installed successfully.");
    } catch (error) {
        console.error("Dependency Installation Error:", error);
        vscode.window.showErrorMessage("SwiftCommit: Failed to install dependencies. Check the console for details.");
    }
}

/**
 * Detects whether to use `python` or `python3` based on the system.
 */
async function getPythonCommand(): Promise<string> {
    try {
        await execPromise("python --version");
        return "python";
    } catch {
        try {
            await execPromise("python3 --version");
            return "python3";
        } catch {
            throw new Error("Python is not installed or not in PATH.");
        }
    }
}
