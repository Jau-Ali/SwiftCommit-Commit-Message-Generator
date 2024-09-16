import sys
import os
from transformers import BartTokenizer, BartForConditionalGeneration

def generate_commit_message(diff):
    model_path = './swiftcommit_model'
    tokenizer_path = './swiftcommit_tokenizer'

    if not (os.path.exists(model_path) and os.path.exists(tokenizer_path)):
        raise FileNotFoundError("Model or tokenizer path does not exist.")

    try:
        tokenizer = BartTokenizer.from_pretrained(tokenizer_path)
        model = BartForConditionalGeneration.from_pretrained(model_path)
    except Exception as e:
        raise RuntimeError(f"Error loading model or tokenizer: {e}")

    try:
        inputs = tokenizer(diff, return_tensors='pt', truncation=True, max_length=1024)
        outputs = model.generate(
            inputs['input_ids'],
            max_new_tokens=150,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=2,
            length_penalty=2.0,
            decoder_start_token_id=tokenizer.pad_token_id
        )
        message = tokenizer.decode(outputs[0], skip_special_tokens=True)
        message = message.replace("#<I>", "")
        return message.strip()
    except Exception as e:
        raise RuntimeError(f"Error generating commit message: {e}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("No diff provided.")
        sys.exit(1)

    diff = sys.argv[1]

    try:
        message = generate_commit_message(diff)
        print(message)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
