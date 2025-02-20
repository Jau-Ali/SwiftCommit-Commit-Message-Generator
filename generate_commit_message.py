import sys
import os
from transformers import RobertaTokenizer, T5ForConditionalGeneration

def generate_commit_message(diff):
    model_path = "C:/xampp/htdocs/SwiftCommit-Commit-Message-Generator/SwiftCommit/codeT5-model"
    tokenizer_path = "C:/xampp/htdocs/SwiftCommit-Commit-Message-Generator/SwiftCommit/codeT5-tokenizer"

    if not (os.path.exists(model_path) and os.path.exists(tokenizer_path)):
        raise FileNotFoundError("Model or tokenizer path does not exist.")

    tokenizer = RobertaTokenizer.from_pretrained(tokenizer_path)
    model = T5ForConditionalGeneration.from_pretrained(model_path)

    #Provide explicit prompt to guide the model
    prompt = f"### Commit message for the following code diff:\n{diff}\n### Commit message:"

    inputs = tokenizer(prompt, return_tensors='pt', padding=True, truncation=True, max_length=1024)

    outputs = model.generate(
        input_ids=inputs['input_ids'],
        attention_mask=inputs['attention_mask'],
        max_new_tokens=150,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2,
        length_penalty=2.0,
        decoder_start_token_id=tokenizer.pad_token_id
    )

    message = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    #Ensure the message ends with a period.
    if not message.endswith("."):
        message += "."

    return message

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
