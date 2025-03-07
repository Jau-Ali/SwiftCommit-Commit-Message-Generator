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

    // Ensure dependencies are installed with a progress bar
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
        },
        async (progress) => {
            try {
                const dependenciesInstalled = await ensureDependencies(progress);
                vscode.window.showInformationMessage(
                    `SwiftCommit: ${dependenciesInstalled ? "All dependencies are already installed." : "Dependencies installed successfully."}`
                );
            } catch (error) {
                vscode.window.showErrorMessage("SwiftCommit: Failed to install dependencies. Check console for details.");
                console.error("Dependency Installation Error:", error);
            }
        }
    );

    let disposableGenerate = vscode.commands.registerCommand("swiftcommit.generateMessage", async () => {
        commitMessage = "";
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage("SwiftCommit: No workspace folder found.");
            return;
        }

        try {
            // Get all staged diffs
            const { stdout: diff } = await execPromise(`git diff --cached`, {
                cwd: workspaceFolder.uri.fsPath,
            });

            if (!diff.trim()) {
                vscode.window.showInformationMessage("SwiftCommit: No staged changes detected.");
                return;
            }

            messageProvider.setMessage("Generating commit message.");

            // Write diff to a temp file
            const tempFilePath = path.join(workspaceFolder.uri.fsPath, "temp_diff.txt");
            await fs.promises.writeFile(tempFilePath, diff, "utf-8");

            // Run Python script with the temp file
            const scriptPath = path.join(__dirname, "../generate_commit_message.py");

            if (!fs.existsSync(scriptPath)) {
                vscode.window.showErrorMessage("SwiftCommit: Python script not found.");
                return;
            }

            const pythonCmd = await getPythonCommand();
            const { stdout: generatedMsg } = await execPromise(`${pythonCmd} "${scriptPath}" "${tempFilePath}"`);

            // Remove the temp file
            await fs.promises.unlink(tempFilePath);

            commitMessage = generatedMsg.replace(/\s+/g, " ").trim();
            messageProvider.setMessage(commitMessage);
            setSCMInputBox(commitMessage);

            vscode.window.showInformationMessage("SwiftCommit: Commit message generated successfully!");
        } catch (error) {
            console.error("Commit Message Generation Error:", error);
            vscode.window.showErrorMessage("SwiftCommit: Failed to generate commit message. See console for details.");
        }
    });

    let disposableCopy = vscode.commands.registerCommand("swiftcommitView.copyToClipboard", async () => {
        if (commitMessage) {
            try {
                await vscode.env.clipboard.writeText(commitMessage);
                vscode.window.showInformationMessage("SwiftCommit: Commit message copied to clipboard.");
            } catch (error) {
                vscode.window.showErrorMessage("SwiftCommit: Failed to copy commit message.");
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
        vscode.window.showErrorMessage("SwiftCommit: Git extension not available or no repository found.");
    }
}

/**
 * Ensures that required Python dependencies (`transformers` and `torch`) are installed.
 * Returns `true` if both are installed, otherwise installs them.
 */
async function ensureDependencies(progress: vscode.Progress<{ message?: string }>): Promise<boolean> {
    try {
        const pythonCmd = await getPythonCommand();
        progress.report({ message: "SwiftCommit: Checking dependencies." });

        // Check if both transformers and torch are installed
        const installedPackages = await execPromise(`${pythonCmd} -m pip list`);
        const hasTransformers = installedPackages.stdout.includes("transformers");
        const hasTorch = installedPackages.stdout.includes("torch");

        if (hasTransformers && hasTorch) {return true;} // Dependencies already installed

        // Install missing dependencies
        progress.report({ message: "SwiftCommit: Installing dependencies." });
        const missingPackages = [];
        if (!hasTransformers) {missingPackages.push("transformers");}
        if (!hasTorch) {missingPackages.push("torch");}

        await execPromise(`${pythonCmd} -m pip install --quiet ${missingPackages.join(" ")}`);
        progress.report({ message: "Dependencies installed successfully." });

        return false; // Dependencies were installed
    } catch (error) {
        console.error("Dependency Installation Error:", error);
        throw new Error("SwiftCommit: Failed to install dependencies.");
    }
}

/**
 * Detects the correct Python command (`python`, `python3`, or uses `sys.executable`).
 */
async function getPythonCommand(): Promise<string> {
    try {
        // Use Python's built-in executable detection to avoid OS-specific issues
        const { stdout } = await execPromise("python -c \"import sys; print(sys.executable)\"");
        return stdout.trim();
    } catch {
        try {
            // Try python3 if python isn't available
            const { stdout } = await execPromise("python3 -c \"import sys; print(sys.executable)\"");
            return stdout.trim();
        } catch {
            throw new Error("SwiftCommit: Python is not installed or not in PATH.");
        }
    }
}
