#  
# This file is part of SwiftCommit.  
#  
# SwiftCommit is free software: you can redistribute it and/or modify  
# it under the terms of the GNU General Public License as published by  
# the Free Software Foundation, either version 3 of the License, or  
# (at your option) any later version.  
#  
# SwiftCommit is distributed in the hope that it will be useful,  
# but WITHOUT ANY WARRANTY; without even the implied warranty of  
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the  
# GNU General Public License for more details.  
#  
# You should have received a copy of the GNU General Public License  
# along with SwiftCommit. If not, see <https://www.gnu.org/licenses/>.  
#


import sys
import os
from transformers import RobertaTokenizer, T5ForConditionalGeneration

# Set paths dynamically based on the script's location
current_script_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_script_path, "codeT5-model")
tokenizer_path = os.path.join(current_script_path, "codeT5-tokenizer")

def generate_commit_message(diff):
    if not (os.path.exists(model_path) and os.path.exists(tokenizer_path)):
        raise FileNotFoundError("Model or tokenizer path does not exist.")

    tokenizer = RobertaTokenizer.from_pretrained(tokenizer_path)
    model = T5ForConditionalGeneration.from_pretrained(model_path)

    # Extract file-specific changes
    file_diffs = {}
    current_file = None

    for line in diff.splitlines():
        if line.startswith("diff --git"):
            parts = line.split(" ")
            if len(parts) > 2:
                current_file = parts[-1].strip()
                file_diffs[current_file] = []
        elif line.startswith("-") or line.startswith("+"):
            if current_file:
                file_diffs[current_file].append(line.strip())

    if not file_diffs:
        return "No significant changes detected."

    commit_messages = []

    for file, changes in file_diffs.items():
        file_name = os.path.basename(file)

        # Generate commit message for each file separately
        prompt = f"### Code changes for {file_name}:\n" + "\n".join(changes) + "\n\n### Commit message:"
        inputs = tokenizer(prompt, return_tensors='pt', padding=True, truncation=True, max_length=1024)

        outputs = model.generate(
            input_ids=inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_new_tokens=100,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=2,
            length_penalty=1.0,
            decoder_start_token_id=tokenizer.pad_token_id
        )

        message = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        #  Fix capitalization issues
        if message and message[0].islower():
            message = message[0].upper() + message[1:]

        commit_messages.append(message)

    #  Combine messages with "and" instead of separate lines
    if len(commit_messages) > 1:
        final_message = " and ".join(commit_messages) + "."
    else:
        final_message = commit_messages[0] + "."

    return final_message

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("No diff file provided.", file=sys.stderr)
        sys.exit(1)

    temp_file_path = sys.argv[1]

    try:
        with open(temp_file_path, 'r', encoding='utf-8') as f:
            diff = f.read().strip()
    except Exception as e:
        print(f"Error reading diff file: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        message = generate_commit_message(diff)
        print(message)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
