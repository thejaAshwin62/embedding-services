import React, { useState, useRef, useEffect, useMemo } from "react";

import { useUser } from "@clerk/clerk-react";

import { useChat } from "../Context/ChatContext";

import customFetch from "../utils/customFetch";

import { getChatResponse, createNewChat } from "../utils/geminiService";

const GlobalChatBot = () => {
  const { user } = useUser();

  const { aiName, userName } = useChat();

  const [inputMessage, setInputMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);

  // Initialize chat instance when component mounts
  const [chatInstance, setChatInstance] = useState(null);

  useEffect(() => {
    setChatInstance(createNewChat());
  }, []);

  // Load messages from database

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await customFetch.get(`/global-chat/${user.id}`);

        if (response.data.length > 0) {
          setMessages(response.data);
        } else {
          // Add welcome message if no messages exist

          const welcomeMessage = {
            id: Date.now().toString(),

            content: `👋 Hi ${userName}! I'm your ${aiName} AI Assistant powered by Google's Gemini.

I can help you with:

🔍 General Knowledge

💡 Problem Solving

📚 Research & Learning

💻 Coding & Technical Help

🎨 Creative Ideas

Feel free to ask me anything! I'm here to assist you.`,

            sender: "bot",

            timestamp: new Date().toISOString(),

            displayTime: new Date().toLocaleTimeString([], {
              hour: "2-digit",

              minute: "2-digit",
            }),

            userId: user?.id,

            userName: userName,
          };

          setMessages([welcomeMessage]);

          await customFetch.post(`/global-chat/${user.id}`, {
            message: welcomeMessage,
          });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    if (user?.id) {
      loadMessages();
    }
  }, [user?.id, userName, aiName]);

  // Add formatDate helper function
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    const dayName = messageDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today · ${dayName}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday · ${dayName}`;
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Add groupMessagesByDate function
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = message.timestamp ? new Date(message.timestamp).toDateString() : new Date().toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  // Modify handleSubmit to include full date
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatInstance) return;

    const currentDate = new Date();
    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: currentDate.toISOString(),
      displayTime: currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      userId: user?.id,
      userName: userName,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputMessage("");

    setIsTyping(true);

    try {
      // Save user message to database

      await customFetch.post(`/global-chat/${user.id}`, {
        message: userMessage,
      });

      // Get Gemini response using the chat service
      const { text: botResponse, chatInstance: updatedChat } = await getChatResponse(
        inputMessage,
        chatInstance
      );

      // Update chat instance if needed
      if (updatedChat) {
        setChatInstance(updatedChat);
      }

      const botMessage = {
        id: Date.now().toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userId: "bot",
        userName: aiName,
      };

      // Save bot message to database

      await customFetch.post(`/global-chat/${user.id}`, {
        message: botMessage,
      });

      // Update local state

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        id: Date.now().toString(),

        content: "I apologize, but I encountered an error. Please try again.",

        sender: "bot",

        timestamp: new Date().toISOString(),

        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",

          minute: "2-digit",
        }),

        userId: "bot",

        userName: aiName,
      };

      setMessages((prev) => [...prev, errorMessage]);

      await customFetch.post(`/global-chat/${user.id}`, {
        message: errorMessage,
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Add this function to handle chat clearing

  const handleClearGlobalChat = async () => {
    try {
      await customFetch.delete(`/global-chat/${user.id}`);

      setMessages([]); // Clear messages locally

      // Create new chat instance
      const newChatInstance = createNewChat();
      setChatInstance(newChatInstance);

      // Add welcome message after clearing

      const welcomeMessage = {
        id: Date.now().toString(),

        content: `👋 Hi ${userName}! I'm your ${aiName} AI Assistant powered by Google's Gemini.

I can help you with:

🔍 General Knowledge

💡 Problem Solving

📚 Research & Learning

💻 Coding & Technical Help

🎨 Creative Ideas

Feel free to ask me anything! I'm here to assist you.`,

        sender: "bot",

        timestamp: new Date().toISOString(),

        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",

          minute: "2-digit",
        }),

        userId: user?.id,

        userName: userName,
      };

      setMessages([welcomeMessage]);

      await customFetch.post(`/global-chat/${user.id}`, {
        message: welcomeMessage,
      });
    } catch (error) {
      console.error("Error clearing global chat:", error);
    }
  };

  // Make handleClearGlobalChat available to parent component

  useEffect(() => {
    if (window) {
      window.handleClearGlobalChat = handleClearGlobalChat;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-6 bg-gray-50">
        {groupMessagesByDate(messages).map(({ date, messages: dateMessages }, groupIndex) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 flex items-center justify-center py-2">
              <div className="bg-primary-950/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary-950/10">
                <span className="text-sm font-medium text-primary-950">
                  {formatDate(date)}
                </span>
              </div>
            </div>
            
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`chat ${
                  message.sender === "user" ? "chat-end" : "chat-start"
                }`}
              >
                <div className="chat-image avatar placeholder">
                  <div
                    className={`w-10 rounded-full ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-primary-950 text-white"
                    }`}
                  >
                    <span>
                      {message.sender === "user" ? userName[0] : aiName[0]}
                    </span>
                  </div>
                </div>
                <div className="chat-header mb-1 text-gray-600">
                  {message.sender === "user" ? userName : aiName}
                  {message.displayTime && (
                    <time className="text-xs opacity-50 ml-2">
                      {message.displayTime}
                    </time>
                  )}
                </div>
                <div
                  className={`chat-bubble ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar placeholder">
              <div className="bg-primary-950 text-white w-8 sm:w-10 rounded-full">
                <span className="text-sm sm:text-base">{aiName[0]}</span>
              </div>
            </div>
            <div className="chat-bubble bg-white text-gray-800 border border-gray-200">
              <div className="flex gap-1">
                <span className="loading loading-ball loading-sm"></span>
                <span className="loading loading-ball loading-sm"></span>
                <span className="loading loading-ball loading-sm"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-2 sm:p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="input input-bordered flex-1 bg-white focus:bg-white text-black min-w-0"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? (
              <span className="loading loading-ball loading-sm"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalChatBot;
