<div style="text-align: center;">

# SwiftCommit

</div>

<div style="text-align: center; padding-bottom:10px">
<img src="images/my-icon.png" alt="SwiftCommit Screenshot" width="200" style="border-radius: 50%;">

### A VS Code extension that automatically generates commit messages using NLP.
</div>

## Key features include:

- **Automatic Commit Messages**: Generate meaningful commit messages based on code diffs.
- **Real-time Integration**: Seamlessly integrates with VS Code’s version control system.

## Requirements

- **Git**: Ensure you have Git installed. [Download Git](https://git-scm.com/downloads/)
- **GitHub Desktop**: Install GitHub Desktop. [Download GitHub Desktop](https://desktop.github.com/)


## Known Issues

- **Commit Message Quality**: The NLP model generates commit messages based on code changes; however, some messages may require minor refinement based on user preferences for clarity and accuracy.

- **Performance Considerations**: While the model processes most code diffs efficiently, larger diffs may result in slightly increased processing times.

- **Handling Complex or Minimal Changes**: The model is designed to handle a wide range of code modifications; however, it may not always fully capture highly complex, ambiguous, or very minor code changes.

<div style="padding-bottom:30px">

## Release Notes

### 0.3.0


- **Trained NLP Model Integrated**: The extension now uses a fully trained NLP model.
- **Commit Message Auto-Population**:  Automatically inserts generated commit messages into the VS Code Source Control commit input field.


### 0.2.0

- **Commit Message Generation**: Added functionality for generating commit messages based on code diffs using an NLP model.

### 0.1.0

- **Initial Setup**: The functionality for generating commit messages based on code diffs has not yet been implemented. The NLP model used for generating commit messages is still under training and has not yet been integrated.

- **Development Preview**: The extension is in a development preview phase; further testing, model integration, and enhancements are ongoing.

</div>

---
<div style="margin-top: 30px; text-align: center;">

### *Enjoy using SwiftCommit!*

</div>
