import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "../Context/ChatContext";
import customFetch from "../utils/customFetch";
import GlobalChatBot from "../Componenets/GlobalChatBot";
import { BadgePlus } from "lucide-react";
import { BotMessageSquare } from "lucide-react";
import { BrainCircuit } from "lucide-react";

const ChatBot = () => {
  const { user } = useUser();
  const {
    chats,
    currentChatId,
    createNewChat,
    addMessageToChat,
    deleteChat,
    clearAllChats,
    setCurrentChatId,
    isLoading,
    updateChatTitle,
    aiName,
    userName,
  } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const initializationRef = useRef(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatType, setChatType] = useState("personal"); // 'personal' or 'global'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Sample suggestions based on common queries
  const querySuggestions = [
    "What did I do today at ",
    "Where was I yesterday at ",
    "What happened on ",
    "What was I doing at ",
    "Tell me about my activities on ",
    "What were my tasks at ",
  ];

  // Handle input change with suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Generate suggestions
    if (value.trim()) {
      const filtered = querySuggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        .map((suggestion) => {
          // If suggestion is a time-based query, add current time
          if (suggestion.endsWith("at ")) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return suggestion + timeStr;
          }
          // If suggestion asks for a date, add today's date
          if (suggestion.endsWith("on ")) {
            const today = new Date();
            const dateStr = today.toLocaleDateString();
            return suggestion + dateStr;
          }
          return suggestion;
        });
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current chat messages
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    // Only run initialization once and when chats are loaded
    if (!initializationRef.current && !isLoading) {
      if (chats.length === 0) {
        // Only create new chat if there are no existing chats
        createNewChat();
      } else if (!currentChatId) {
        // If there are chats but none selected, select the most recent one
        setCurrentChatId(chats[chats.length - 1].id);
      }
      initializationRef.current = true;
    }
  }, [chats, currentChatId, createNewChat, setCurrentChatId, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  // Modify the formatDate function to be more detailed
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

  // Modify the message creation in handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;

    const userQuery = inputMessage;
    const currentDate = new Date().toISOString();

    // Create and immediately display user message
    const userMessage = {
      id: Date.now(),
      content: userQuery,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: currentDate, // Add date field
    };

    // Add user message to chat immediately
    await addMessageToChat(currentChatId, userMessage);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Save user query to the database
      await customFetch.post("/user-queries", {
        userId: user.id,
        query: userQuery,
        chatId: currentChatId,
      });

      // Fetch response from server
      const response = await customFetch.post("/search", {
        query: userQuery,
      });

      let botResponse;
      if (response.data.error) {
        botResponse = response.data.message;
      } else if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        botResponse = `On ${result.Date} at ${result.Time}, ${result.Feedback}`;
      } else if (response.data.message) {
        botResponse = response.data.message;
      } else {
        botResponse =
          "I couldn't find any memories matching your query. Try asking about a specific time and date, like 'what did I do today morning?' or 'what happened yesterday at 2 PM?'";
      }

      const botMessage = {
        id: Date.now(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: currentDate, // Add date field
        userQuery: userQuery,
      };

      // Add bot message to chat
      await addMessageToChat(currentChatId, botMessage);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        id: Date.now(),
        content:
          "I'm having trouble connecting to the server. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userQuery: userQuery,
      };
      await addMessageToChat(currentChatId, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // Add this function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = message.date ? new Date(message.date).toDateString() : new Date().toDateString();
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

  // Add function to group chats by time period
  const groupChatsByDate = (chats) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);

      if (chatDate.toDateString() === today.toDateString()) {
        groups.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat);
      } else if (chat >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  // Group the chats
  const groupedChats = groupChatsByDate(chats);

  // Add this function to handle chat type changes
  const handleChatTypeChange = (type) => {
    setChatType(type);
    setIsDropdownOpen(false);
    if (type === "global") {
      setIsSidebarOpen(false); // Close sidebar when switching to global chat
    }
  };

  // Add this function to handle global chat clearing
  const handleClearGlobalChat = () => {
    // Call the function from GlobalChatBot component
    if (window.handleClearGlobalChat) {
      window.handleClearGlobalChat();
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  // Function to toggle speech recognition
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Modify the sidebar render to include groups
  return (
    <div className="h-[calc(100vh-64px)] bg-primary-50 flex flex-col md:flex-row md:pl-10 md:pr-10 ">
      {/* Sidebar Toggle Button for Mobile - Updated positioning */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-[14px] left-3 z-[1000] bg-primary-950 text-white p-2 rounded-md shadow-lg hover:bg-primary-800 transition-all"
        aria-label="Toggle Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Sidebar - Updated z-index */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white border-r border-gray-200 flex flex-col z-[999] h-full overflow-hidden`}
      >
        {/* Header Section - Fixed */}
        <div className="flex-shrink-0 mt-16  md:mt-0 ">
          {/* Chat Type Toggle */}
          <div className="p-2 sm:p-4 border-b ">
            <div className="dropdown w-full">
              <label
                tabIndex={0}
                className="w-full btn bg-primary-50 text-primary-950 hover:bg-primary-100 flex justify-between items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {chatType === "personal" ? (
                    <div className="flex items-center gap-2">
                      <BotMessageSquare />
                      {`${aiName} Chat`}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BrainCircuit />
                      Global Chat
                    </div>
                  )}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              {isDropdownOpen && (
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-1 z-[1000] "
                >
                  <li>
                    <a
                      className={chatType === "personal" ? "active" : ""}
                      onClick={() => {
                        handleChatTypeChange("personal");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <h1
                        className={
                          chatType === "personal" ? "text-primary-50" : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <BotMessageSquare />
                          {`${aiName} Chat`}
                        </div>
                      </h1>
                    </a>
                  </li>
                  <li>
                    <a
                      className={chatType === "global" ? "active" : ""}
                      onClick={() => {
                        handleChatTypeChange("global");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <h1
                        className={
                          chatType === "global" ? "text-primary-50" : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <BrainCircuit />
                          Global Chat
                        </div>
                      </h1>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* New Chat Button - Only in personal mode */}
          {chatType === "personal" && (
            <div className="p-2 sm:p-4 border-b">
              <button
                onClick={createNewChat}
                className="w-full bg-primary-950 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <BadgePlus />
                  New Chat
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {chatType === "personal" && (
            <div className="h-full">
              {/* Today's Chats */}
              {groupedChats.today.length > 0 && (
                <div className="mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white z-10">
                    Today
                  </div>
                  {groupedChats.today.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        chat.id === currentChatId ? "bg-gray-100" : ""
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={async () => {
                            if (editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                            }
                            setEditingChatId(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                              setEditingChatId(null);
                            }
                          }}
                          className="flex-1 mr-2 px-2 py-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="truncate flex-1 pr-2 text-gray-700"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          {chat.title}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === chat.id ? null : chat.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 relative z-[1000]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {showMenu === chat.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1001]"
                            style={{
                              top: "auto",
                              right: "1rem",
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChatId(chat.id);
                                  setEditingTitle(chat.title);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Name
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Yesterday's Chats */}
              {groupedChats.yesterday.length > 0 && (
                <div className="mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white z-10">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        chat.id === currentChatId ? "bg-gray-100" : ""
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={async () => {
                            if (editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                            }
                            setEditingChatId(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                              setEditingChatId(null);
                            }
                          }}
                          className="flex-1 mr-2 px-2 py-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="truncate flex-1 pr-2 text-gray-700"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          {chat.title}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === chat.id ? null : chat.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 relative z-[1000]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {showMenu === chat.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1001]"
                            style={{
                              top: "auto",
                              right: "1rem",
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChatId(chat.id);
                                  setEditingTitle(chat.title);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Name
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Last 7 Days */}
              {groupedChats.lastWeek.length > 0 && (
                <div className="mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white z-10">
                    Last 7 Days
                  </div>
                  {groupedChats.lastWeek.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        chat.id === currentChatId ? "bg-gray-100" : ""
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={async () => {
                            if (editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                            }
                            setEditingChatId(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                              setEditingChatId(null);
                            }
                          }}
                          className="flex-1 mr-2 px-2 py-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="truncate flex-1 pr-2 text-gray-700"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          {chat.title}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === chat.id ? null : chat.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 relative z-[1000]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {showMenu === chat.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1001]"
                            style={{
                              top: "auto",
                              right: "1rem",
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChatId(chat.id);
                                  setEditingTitle(chat.title);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Name
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Older */}
              {groupedChats.older.length > 0 && (
                <div className="mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white z-10">
                    Older
                  </div>
                  {groupedChats.older.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        chat.id === currentChatId ? "bg-gray-100" : ""
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={async () => {
                            if (editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                            }
                            setEditingChatId(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && editingTitle.trim()) {
                              await updateChatTitle(
                                chat.id,
                                editingTitle.trim()
                              );
                              setEditingChatId(null);
                            }
                          }}
                          className="flex-1 mr-2 px-2 py-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="truncate flex-1 pr-2 text-gray-700"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          {chat.title}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === chat.id ? null : chat.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 relative z-[1000]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {showMenu === chat.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1001]"
                            style={{
                              top: "auto",
                              right: "1rem",
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChatId(chat.id);
                                  setEditingTitle(chat.title);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Name
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                  setShowMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Section - Fixed */}
        <div className="flex-shrink-0 p-2 sm:p-4 border-t">
          {chatType === "personal" ? (
            <button
              onClick={clearAllChats}
              className="w-full text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition-colors text-sm"
            >
              Clear All Chats
            </button>
          ) : (
            <button
              onClick={handleClearGlobalChat}
              className="w-full text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition-colors text-sm"
            >
              Clear Global Chat
            </button>
          )}
        </div>
      </div>

      {/* Overlay for mobile - Updated z-index */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {chatType === "personal" ? (
          // Personal Chat Content
          <div className="flex-1 flex flex-col h-full">
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
                        {message.timestamp && (
                          <time className="text-xs opacity-50 ml-2">
                            {message.timestamp}
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
                        {message.sender === "bot" && message.userQuery && (
                          <div className="text-sm text-gray-500 mb-2">
                            <h1 className="font-medium bg-blue-500 text-white px-2 py-1 rounded-md">
                              You asked: {message.userQuery}
                            </h1>
                          </div>
                        )}
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-image avatar placeholder">
                    <div className="bg-primary-950 text-white w-10 rounded-full">
                      <span>AI</span>
                    </div>
                  </div>
                  <div className="chat-bubble bg-white text-gray-800 border border-gray-200">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-2 sm:p-4 bg-white border-t mt-auto relative">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Ask about your memories..."
                    className="input input-bordered w-full bg-white focus:bg-white text-black min-w-0"
                  />
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute bottom-full left-0 w-full bg-white border rounded-md shadow-lg mb-1 max-h-48 overflow-y-auto z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`btn ${isListening ? "btn-error" : "btn"}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    // Microphone Active Icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  ) : (
                    // Microphone Inactive Icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!inputMessage.trim() || isTyping}
                >
                  {isTyping ? (
                    <span className="loading loading-spinner loading-sm text-primary-50"></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-primary-50 "
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </form>
              {/* Add a message when browser doesn't support speech recognition */}
              {!("webkitSpeechRecognition" in window) && (
                <p className="text-xs text-red-500 mt-1">
                  Speech recognition is not supported in your browser. Please
                  use Chrome for this feature.
                </p>
              )}
            </div>
          </div>
        ) : (
          // Global Chat Content
          <GlobalChatBot />
        )}
      </div>
    </div>
  );
};

export default ChatBot;
