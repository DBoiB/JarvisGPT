document.addEventListener('DOMContentLoaded', function () {
    const chatBox = document.getElementById('chat-box');
    const inputField = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    function appendMessage(role, text, isCode = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(role);
        const textDiv = document.createElement('div');

        if (isCode) {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = text;
            pre.appendChild(code);
            textDiv.appendChild(pre);
        } else {
            // Use marked.js to convert Markdown to HTML and DOMPurify to sanitize
            textDiv.innerHTML = DOMPurify.sanitize(marked.parse(text));
        }

        messageDiv.appendChild(textDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showThinkingMessage() {
        appendMessage('chatbot', 'Thinking...');
        return chatBox.lastChild;
    }

    function updateMessage(element, newText, isCode = false) {
        if (isCode) {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = newText;
            pre.appendChild(code);
            element.firstChild.replaceWith(pre);
        } else {
            // Use marked.js and DOMPurify for non-code responses as well
            element.firstChild.innerHTML = DOMPurify.sanitize(marked.parse(newText));
        }
    }

    sendButton.addEventListener('click', function () {
        const userMessage = inputField.value;
        if (userMessage.trim() === '') return;

        appendMessage('user', userMessage);
        inputField.value = '';

        const thinkingMessageElement = showThinkingMessage();

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        })
            .then(response => response.json())
            .then(data => {
                // Update this based on your logic to detect if the response is code
                const isCodeResponse = false;
                updateMessage(thinkingMessageElement, data.message, isCodeResponse);
            })
            .catch(error => {
                console.error('Error sending message:', error);
                updateMessage(thinkingMessageElement, 'Error: Could not get a response.');
            });
    });

    inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });
});
