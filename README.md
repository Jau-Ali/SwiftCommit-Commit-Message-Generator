# SwiftCommit⚡
> A VS Code extension that automatically generates commit messages using NLP.

<div align="center">

<!-- Must not be SVG. Also all image URLs must be full HTTPS URLs - absolute paths. -->
<div href="https://marketplace.visualstudio.com/items?itemName=SaliJau28.swiftcommit"
    title="Go to Marketplace extension page">

<img src="https://raw.githubusercontent.com/Jau-Ali/SwiftCommit-Commit-Message-Generator/refs/heads/master/images/transparent-logo.png"
    alt="Logo"
    width="500" />
</div>

</div>


## 🔍Preview

SwiftCommit analyzes staged changes in your Git repository and generates a concise, context-aware commit message within the VS Code source control pane.

<div align="center">
    <img src="https://raw.githubusercontent.com/Jau-Ali/SwiftCommit-Commit-Message-Generator/refs/heads/master/images/demo.gif"
        alt="sample screenshot of chore"
        width="1000" />
</div>


## 🚀Getting started

## 🔧 Prerequisites
<p>Before using <strong>SwiftCommit</strong>, ensure you have the following installed on your system:</p>

<ul>
    <li>🐍 <strong><a href="https://www.python.org/downloads/">Python 3.8+</a></strong> – Required for running the commit message generation model</li>
    <li>🌱 <strong><a href="https://git-scm.com/downloads">Git</a></strong> – For version control and diff extraction</li>
    <li>🖥️ <strong><a href="https://code.visualstudio.com/">Visual Studio Code</a></strong> – With the SwiftCommit extension installed</li>
</ul>

<p><strong>🛠 To check if Python is installed, run the following command in your terminal or command prompt:</strong></p>

<pre><code>python --version</code></pre>

<p>If you see an error or an older version, download and install Python from <a href="https://www.python.org/downloads/">python.org</a>.</p>

## How to install and run the extension in VS Code.

### 1️⃣ Open Visual Studio Code.

### 2️⃣ Go to Extensions (Ctrl+Shift+X).

### 3️⃣ Search for SwiftCommit.

### 4️⃣ Click Install.

### 5️⃣ Restart VS Code if necessary.

## ⚠️ Important: Wait for Dependencies to Install!
<p>After installing SwiftCommit, <strong>please wait for the Python dependencies to install completely</strong> before using the extension.</p>

<p>📌 SwiftCommit automatically installs <code>transformers</code> and <code>torch</code> when activated for the first time.</p>

<ul>
    <li>⏳ This process may take a few minutes, depending on your internet speed.</li>
    <li>🔍 If you experience issues, check the <strong>VS Code output console</strong> for installation logs.</li>
    <li>🛠️ You can also manually install dependencies by running:</li>
</ul>

<pre><code>python -m pip install transformers torch</code></pre>

<p>✅ Once the installation is complete, you can start generating commit messages! 🚀</p>



## ✨Features
<ul>
    <li>🤖 <strong>Automated Commit Messages:</strong> Generates meaningful commit messages based on code changes.</li>
    <li>📂 <strong>Supports Multiple File Types:</strong> Recognizes various programming languages and file extensions.</li>
    <li>📌 <strong>Conventional Commits:</strong> Applies prefixes like <code>feat</code>, <code>fix</code>, <code>chore</code>, <code>docs</code>, and more.</li>
    <li>⚡ <strong>One-Click Generation:</strong> Just press a button—no manual input required.</li>
    <li>🧠 <strong>Optimized NLP Model:</strong> Uses a fine-tuned <code>CodeT5</code> model for accurate commit summaries.</li>
    <li>🚀 <strong>Fast & Efficient:</strong> Works seamlessly within your Git workflow.</li>
</ul>

## ⚖️Comparison with other extensions

### 🔄 Unlike Traditional Extensions

<ul>
    <li> Other extensions often require an <strong>API key</strong> because they use:</li>
    <ul>
        <li>🤖 OpenAI's GPT (which requires a paid API key)</li>
        <li>☁️ Hugging Face’s hosted models (which may need a free/paid key)</li>
        <li>🖥️ Custom server-based AI models</li>
    </ul>
</ul>

<ul>
    <li> <strong>SwiftCommit is different</strong> because:</li>
    <ul>
        <li>💻 <strong>Runs locally after setup</strong> Internet is needed only for the initial download.</li>
        <li>🔐 <strong>No API keys or account setup</strong> needed.</li>
        <li>⚡ <strong>Faster processing</strong> since everything happens on the user’s machine.</li>
    </ul>
</ul>

### This makes SwiftCommit faster, more private, and easier to use. 🚀

## 🤖Powered by AI

#### SwiftCommit leverages CodeT5, a transformer-based NLP model trained specifically for code-related tasks. It analyzes diffs and generates commit messages that align with best practices and human-written summaries.

## 📜 License

<p>
    <strong>SwiftCommit</strong> is free software: you can redistribute it and/or modify  
    it under the terms of the <a href="https://www.gnu.org/licenses/" target="_blank">GNU General Public License</a> 
    as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
</p>

<p>
    SwiftCommit is distributed in the hope that it will be useful,  
    but <strong>WITHOUT ANY WARRANTY</strong>; without even the implied warranty of  
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the  
    <a href="https://www.gnu.org/licenses/" target="_blank">GNU General Public License</a> for more details.
</p>

<p>
    You should have received a copy of the GNU General Public License  
    along with SwiftCommit. If not, see <a href="https://www.gnu.org/licenses/" target="_blank">https://www.gnu.org/licenses/</a>.
</p>

## Credits

### Developed by:

<ul>
    <li>🧑‍💻 <strong>Gene Alprince M. Braga</strong></li>
    <li>👩‍💻 <strong>Antonette S. Manolis</strong></li>
    <li>👨‍💻 <strong>Mohammad Sali S. Jauhari</strong></li>
</ul>


### Adviser:
<li><strong>📘Mr. Jaydee C. Ballaho, MIT</strong></li>


### <div style="text-align: center; font-size: 0.8em; font-style: italic; font-weight: bold;"> 🎓 Special thanks to the <strong>Western Mindanao State University College of Computing Studies</strong> for supporting this research project. </div>
