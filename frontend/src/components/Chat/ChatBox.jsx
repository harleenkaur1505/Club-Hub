// components/Chat/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';

const ChatBox = ({ roomId, roomName, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Determine the socket server URL based on environment
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            path: '/socket.io',
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            // Join the specific club room
            socketRef.current.emit('joinRoom', { room: roomId, userId: currentUser?._id });
        });

        // Listen for message history
        socketRef.current.on('messageHistory', (history) => {
            setMessages(history);
            scrollToBottom();
        });

        // Listen for new messages
        socketRef.current.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            scrollToBottom();
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveRoom', roomId);
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && currentUser && isConnected) {
            socketRef.current.emit('chatMessage', {
                room: roomId,
                user: {
                    _id: currentUser._id,
                    name: currentUser.name || 'Anonymous User',
                },
                message: inputMessage.trim(),
            });
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#3A2415] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#2D1B10] flex items-center justify-between">
                <div>
                    <h3 className="font-outfit font-bold text-white text-lg tracking-wide">
                        {roomName} Chat
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-white/50">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 italic text-sm font-light">No messages here yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        if (msg.system) {
                            return (
                                <div key={index} className="flex justify-center my-2">
                                    <span className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full italic font-light">
                                        {msg.text}
                                    </span>
                                </div>
                            );
                        }

                        const isMine = msg.sender === currentUser?._id;

                        return (
                            <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4`}>
                                <span className={`text-xs text-white/50 mb-1 ml-1 ${isMine ? 'mr-1' : ''}`}>
                                    {isMine ? 'You' : msg.senderName} • {msg.createdAt ? dayjs(msg.createdAt).format('h:mm A') : 'Just now'}
                                </span>
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md
                    ${isMine
                                            ? 'bg-[#84592B] text-white rounded-tr-sm'
                                            : 'bg-[#442D1C] text-white/90 rounded-tl-sm border border-white/5'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#2D1B10] border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={!isConnected}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        style={{ color: '#442D1C' }}
                        className="flex-1 border border-white/10 rounded-xl px-4 py-3 text-[#442D1C] placeholder-[#442D1C] focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 transition-all font-outfit shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || !isConnected}
                        className={`p-3 rounded-xl transition-all transform flex items-center justify-center shadow-lg
              ${inputMessage.trim() && isConnected
                                ? 'bg-[#84592B] text-white hover:bg-[#A67C52] hover:scale-105 hover:shadow-[0_0_15px_rgba(132,89,43,0.4)]'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-[-45deg] ml-1 mb-1">
                            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
