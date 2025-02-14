import React, { createContext, useContext, useState, useEffect } from "react";

import { useUser } from "@clerk/clerk-react";

import customFetch from "../utils/customFetch";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useUser();

  const [chats, setChats] = useState([]);

  const [currentChatId, setCurrentChatId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [aiName, setAiName] = useState("AI Assistant");

  const [userName, setUserName] = useState(user?.firstName || "User");

  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        try {
          setIsLoading(true);

          const response = await customFetch.get(`/chat-history/${user.id}`);

          const sortedChats = response.data.chats
            ? response.data.chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];

          setChats(sortedChats);
        } catch (error) {
          console.error("Error loading chats:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadChats();
  }, [user]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const response = await customFetch.get(
            `/user-preferences/${user.id}`
          );

          setAiName(response.data.aiName);

          setUserName(response.data.userName);
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
      }
    };

    loadPreferences();
  }, [user]);

  const createNewChat = async () => {
    if (!user) return null;

    const welcomeMessage = {
      id: Date.now(),

      content: `👋 Welcome to Your ${aiName} Memory Assistant!



I'm here to help you recall your daily activities. Here's how to get the most out of our chat:



📅 Ask About Specific Times:

• "What did I do today at 2:00 PM?"

• "Where was I yesterday at 3:30 PM?"

• "What happened on 15/12/2023 at 10:45 AM?"



🕐 Recent Activities:

• "What did I do this morning?"

• "What was I doing at lunch time?"

• "Where was I an hour ago?"



💡 Tips:

• Be specific with dates and times

• Use AM/PM for better accuracy

• Include the date for past memories



Ready to explore your memories? Just type your question below! 🚀`,

      sender: "bot",

      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",

        minute: "2-digit",
      }),
    };

    const newChat = {
      id: Date.now().toString(),

      title: "New Chat",

      messages: [welcomeMessage],

      createdAt: new Date().toISOString(),
    };

    try {
      await customFetch.post(`/chat-history/${user.id}`, { chat: newChat });

      setChats((prev) => [newChat, ...prev]);

      setCurrentChatId(newChat.id);

      return newChat.id;
    } catch (error) {
      console.error("Error creating new chat:", error);

      return null;
    }
  };

  const addMessageToChat = async (chatId, message) => {
    if (!user) return;

    try {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            let updatedTitle = chat.title;

            if (chat.messages.length === 0 && message.sender === "user") {
              updatedTitle =
                message.content.slice(0, 30) +
                (message.content.length > 30 ? "..." : "");
            }

            return {
              ...chat,

              title: updatedTitle,

              messages: [...chat.messages, message],
            };
          }

          return chat;
        })
      );

      const chatToUpdate = chats.find((chat) => chat.id === chatId);

      await customFetch.put(`/chat-history/${user.id}/${chatId}`, {
        chat: {
          ...chatToUpdate,

          messages: [...chatToUpdate.messages, message],
        },
      });
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const deleteChat = async (chatId) => {
    if (!user) return;

    try {
      await customFetch.delete(`/chat-history/${user.id}/${chatId}`);

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const clearAllChats = async () => {
    if (!user) return;

    try {
      await customFetch.delete(`/chat-history/${user.id}`);

      setChats([]);

      setCurrentChatId(null);
    } catch (error) {
      console.error("Error clearing chats:", error);
    }
  };

  const updateChatTitle = async (chatId, newTitle) => {
    if (!user) return;

    try {
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, title: newTitle };
        }

        return chat;
      });

      setChats(updatedChats);

      await customFetch.put(`/chat-history/${user.id}/${chatId}`, {
        chat: updatedChats.find((chat) => chat.id === chatId),
      });
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const updateAiName = async (newName) => {
    try {
      await customFetch.put(`/user-preferences/${user.id}`, {
        aiName: newName,
      });

      setAiName(newName);
    } catch (error) {
      console.error("Error updating AI name:", error);
    }
  };

  const updateUserName = async (newName) => {
    try {
      await customFetch.put(`/user-preferences/${user.id}`, {
        userName: newName,
      });

      setUserName(newName);
    } catch (error) {
      console.error("Error updating user name:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,

        currentChatId,

        setCurrentChatId,

        createNewChat,

        addMessageToChat,

        deleteChat,

        clearAllChats,

        isLoading,

        updateChatTitle,

        aiName,

        userName,

        setAiName: updateAiName,

        setUserName: updateUserName,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
