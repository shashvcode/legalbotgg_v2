import { useState, useRef, useEffect } from 'react';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { content: "Hello! I'm your legal assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = { content: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            // Add loading message
            const loadingMessage = { content: 'Thinking...', sender: 'bot' };
            setMessages(prev => [...prev, loadingMessage]);

            // Send request to backend
            const response = await fetch('/legalchat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: input })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Remove loading message and add bot response
            setMessages(prev => {
                const newMessages = prev.filter(msg => msg.content !== 'Thinking...');
                return [...newMessages, { content: data.answer, sender: 'bot' }];
            });
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.message || 'Sorry, there was an error processing your request. Please try again.';
            setMessages(prev => {
                const newMessages = prev.filter(msg => msg.content !== 'Thinking...');
                return [...newMessages, { content: errorMessage, sender: 'bot' }];
            });
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Legal Assistant</h1>
                <p>Ask me anything about legal matters</p>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        <div className="message-content">
                            {message.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-container" onSubmit={handleSubmit}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your legal question here..."
                    rows={1}
                />
                <button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chat; 