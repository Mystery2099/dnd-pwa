#!/usr/bin/env python3
"""
polish_chat.py
An interactive chat interface to refine prompts using Ollama Cloud.
Maintains context so you can iteratively improve your prompts (e.g., "make it shorter").
"""

import os
import sys
import time

try:
    import httpx
except ImportError:
    print("Error: 'httpx' library is missing.", file=sys.stderr)
    print("Please install it using: pip install httpx", file=sys.stderr)
    sys.exit(1)

# --- Configuration ---
BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.ai")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "deepseek-coder")
API_KEY = os.getenv("OLLAMA_API_KEY")

# Color codes for terminal (Optional, makes it look nicer)
GREEN = "\033[92m"
BLUE = "\033[94m"
RESET = "\033[0m"

# System prompt optimized for iterative refinement
SYSTEM_INSTRUCTION = """You are an expert prompt engineer for coding tasks.
Your goal is to rewrite the user's request into a highly precise, concise prompt for an AI coding agent.

Rules:
1. Remove filler, pleasantries, and ambiguity.
2. Keep technical details, filenames, and constraints.
3. If the user asks to modify a previous request (e.g. "make it shorter"), output the UPDATED version of the prompt.
4. Output ONLY the rewritten prompt. No explanations, no "Here is the result:"."""


def call_api(messages: list) -> str:
    """Send the conversation history to the API and get the latest response."""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 512,
        },
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{BASE_URL}/api/chat",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]
    except httpx.HTTPStatusError as e:
        print(
            f"HTTP Error {e.response.status_code}: {e.response.text}", file=sys.stderr
        )
        return "Error processing request."
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return "Error processing request."


def main():
    if not API_KEY:
        print("Error: OLLAMA_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    # Initialize message history with the system instruction
    messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]

    print(f"{BLUE}Ollama Cloud Polisher ({MODEL_NAME}){RESET}")
    print("Type your rough prompt to get a refined version.")
    print("Commands: /clear (reset history), /exit (quit)")
    print("-" * 40)

    while True:
        try:
            # Get user input
            user_input = input(f"{GREEN}You:{RESET} ")

            # Handle commands
            if user_input.strip().lower() in ["/exit", "/quit", "q"]:
                print("Goodbye!")
                break
            if user_input.strip().lower() == "/clear":
                messages = [messages[0]]  # Keep system, drop user/assistant
                print(f"{BLUE}History cleared.{RESET}")
                continue

            if not user_input.strip():
                continue

            # Add user input to history
            messages.append({"role": "user", "content": user_input})

            # Call API
            start_time = time.time()
            result = call_api(messages)
            duration = time.time() - start_time

            # Add AI response to history
            messages.append({"role": "assistant", "content": result})

            # Print result
            print(f"{BLUE}AI:{RESET} {result}")
            print(f"   [{duration:.2f}s]")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except EOFError:
            print("\nExiting...")
            break


if __name__ == "__main__":
    main()
