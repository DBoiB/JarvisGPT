from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__, template_folder='.', static_folder='static')
CORS(app)

# Set your OpenAI API key here
openai.api_key = "YOUR_API_KEY"  # Replace with your actual API key

# Configure the OpenAI client to communicate with your locally hosted model
openai.api_base = "http://localhost:3000/v1"  # Set the API base URL

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=["POST"])
def chat():
    user_message = request.json.get("message")

    try:
        # Prepare a request to your locally hosted model
        completion = openai.ChatCompletion.create(
            model="local-model",  # Replace with the name of your model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_message},
            ]
        )

        # Extract the bot's reply from the completion
        bot_reply = completion.choices[0].message.content

        return jsonify({"message": bot_reply})
    except Exception as e:
        # Handle exceptions such as network errors
        error_message = str(e)
        return jsonify({"message": "An error occurred: " + error_message}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
