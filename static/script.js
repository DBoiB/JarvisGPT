document.addEventListener('DOMContentLoaded', function () {
    const chatBox = document.getElementById('chat-box');
    const inputField = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const regenerateButton = document.getElementById('regenerate-button');
    let lastUserQuery = '';
    let lastBotResponseDiv;
    let isRequestInProgress = false;

    function appendMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(role);
        const textDiv = document.createElement('div');
        textDiv.innerHTML = marked.parse(text);
        textDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        messageDiv.appendChild(textDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendMessageToServer(message, action = '') {
        if (isRequestInProgress) {
            return; // Exit if another request is in progress
        }

        sendButton.disabled = true; // Disable the send button
        isRequestInProgress = true;

        const thinkingMessageDiv = showThinkingMessage();

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, action: action })
        })
        .then(response => response.json())
        .then(data => {
            updateMessage(thinkingMessageDiv, data.message);
            if (action === '') {
                lastUserQuery = message;
                lastBotResponseDiv = thinkingMessageDiv;
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            updateMessage(thinkingMessageDiv, 'Error: Could not get a response.');
        })
        .finally(() => {
            sendButton.disabled = false; // Re-enable the send button
            isRequestInProgress = false;
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', function () {
            const userMessage = inputField.value;
            if (userMessage.trim() === '') return;
            appendMessage('user', userMessage);
            inputField.value = '';
            sendMessageToServer(userMessage);
        });
    }

    if (regenerateButton) {
        regenerateButton.addEventListener('click', function () {
            if (lastUserQuery) {
                sendMessageToServer(lastUserQuery, 'regenerate');
            }
        });
    }

    inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (sendButton && !sendButton.disabled) {
                sendButton.click();
            }
        }
    });

    function showThinkingMessage() {
        appendMessage('chatbot', 'Thinking...');
        return chatBox.lastChild;
    }

    function updateMessage(element, newText) {
        element.firstChild.innerHTML = marked.parse(newText);
        element.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    // Initialize Highlight.js for static content
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
});
