from google import genai

# Initialize the client with your API key
client = genai.Client(api_key="AIzaSyBvFxk259IrwjvA12ym-ONBfoKfhSjHKCs")

def chat():
    print("=== Gemini Terminal ChatBot ===")
    print("Type 'exit' or 'bye' to quit.\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ["exit", "bye"]:
            print("Bot: Goodbye!")
            break
        try:
            # The only required args are model and contents
            response = client.models.generate_content(
                model="gemini-2.5-flash",  # latest Gemini model
                contents=[{"text": user_input}]
            )
            print("Bot:", response.text)
        except Exception as e:
            print("Bot: Error while calling Gemini API:", e)

if __name__ == "__main__":
    chat()