const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

let chatHistory = [];

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Add to history
    chatHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory })
        });
        
        const data = await response.json();
        typingIndicator.classList.add('hidden');
        
        // Add AI response to UI and history
        addMessage(data.response, 'ai');
        chatHistory.push({ role: 'assistant', content: data.response });
    } catch (error) {
        typingIndicator.classList.add('hidden');
        addMessage('Error connecting to AI assistant', 'error');
    }
});

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    if (sender === 'ai') {
        // Simulate typing effect for AI messages
        messageDiv.classList.add('typing');
        let i = 0;
        const interval = setInterval(() => {
            messageDiv.textContent = content.slice(0, i);
            i++;
            if (i > content.length) {
                clearInterval(interval);
                messageDiv.classList.remove('typing');
            }
        }, 20);
    } else {
        messageDiv.textContent = content;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}