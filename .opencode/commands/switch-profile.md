---
description: Switch model profile between deepseek and qwen
---

Switch the OpenCode model profile to **$1**.

Model mapping:
- `deepseek` → `"deepseek/deepseek-v4-flash-free"`
- `qwen` → `"ollama-cloud/qwen3.5:397b-cloud"`

1. Read the global config at `C:\Users\Konstantine\.config\opencode\opencode.jsonc`
2. Update `"model"` and `"small_model"` to the target model value
3. Save the file

After the change, tell the user to run `/reload` to apply.
