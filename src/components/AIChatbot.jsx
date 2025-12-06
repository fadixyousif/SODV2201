// import necessary modules and components
import { useState, useEffect, useRef } from "react";
import { Offcanvas, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import verifyAuth from "../scripts/verifyAuth";

function AIChatbot({ show, setShow }) {
    // define state variables
    const [messages, setMessages] = useState([
        { sender: "system", text: "Hello! How can I assist you today?" }
    ]);

    // input state
    const [input, setInput] = useState("");

    // loading state
    const [isLoading, setIsLoading] = useState(false);

    // ref for scrolling
    const messagesEndRef = useRef(null);

    // function to scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // function to format message text (bold for **text**)
    const formatMessage = (text) => {
        if (!text) return "";
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // function to handle sending message
    const handleSend = async () => {
        // prevent sending empty messages or while loading
        if (!input.trim() || isLoading) return;
        
        // add user message
        const userText = input;

        // update messages state
        const newMessages = [...messages, { sender: "user", text: userText }];

        // set messages with user input
        setMessages(newMessages);

        // clear input field
        setInput("");

        // set loading state
        setIsLoading(true);

        // send message to backend
        try {

            // verify authentication and get token
            const authData = await verifyAuth();
            const token = (authData && authData.success) ? authData.token : null;

            // prepare headers
            const headers = {
                'Content-Type': 'application/json',
            };

            // include authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // make POST request to backend
            const response = await axios.post('http://localhost:5000/api/ai/chatbot', 
                { message: userText, history: messages },
                { headers }
            );

            // extract bot reply from response
            const botReply = response.data.response || response.data.message || response.data.reply || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
            
            // update messages with bot reply
            setMessages(prev => [...prev, { sender: "bot", text: botReply }]);
        } catch (error) {
            // handle errors
            console.error(error);
            setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I encountered an error connecting to the server." }]);
        } finally {

            // reset loading state
            setIsLoading(false);
        }
    };

    // render component
    return (
        // Offcanvas component for chatbot UI
        <Offcanvas show={show} onHide={() => setShow(false)} placement="end" style={{ width: '600px' }}>
            {/* Offcanvas Header */}
            <Offcanvas.Header closeButton>
                {/* Title */}
                <Offcanvas.Title>AI Assistant</Offcanvas.Title>
            </Offcanvas.Header>

            {/* Offcanvas Body */}
            <Offcanvas.Body className="d-flex flex-column p-0" style={{ background: '#232629', color: '#fff' }}>
                {/* Messages container */}
                <div className="flex-grow-1 overflow-auto p-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}>
                            <div 
                                className={`p-3 rounded ${msg.sender === "user" ? "bg-primary text-white" : "bg-secondary text-white"}`}
                                style={{ maxWidth: "80%", borderRadius: "15px", whiteSpace: "pre-wrap" }}
                            >
                                {formatMessage(msg.text)}
                            </div>
                        </div>
                    ))}
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="d-flex justify-content-start mb-3">
                            <div className="p-3 rounded bg-secondary text-white" style={{ maxWidth: "80%", borderRadius: "15px" }}>
                                <Spinner animation="grow" size="sm" /> Typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {/* Input area */}
                <div className="p-3" style={{ borderTop: '1px solid #444' }}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                            style={{ background: '#333', color: '#fff', border: 'none' }}
                        />
                        <Button variant="primary" onClick={handleSend} disabled={isLoading}>Send</Button>
                    </InputGroup>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

// export the component
export default AIChatbot;