import ChatHistory from "../models/chatHistoryModel.js";



export const chatHistoryService = {

  async getUserChats(userId) {

    try {

      let userHistory = await ChatHistory.findOne({ userId });

      if (!userHistory) {

        userHistory = await ChatHistory.create({ userId, chats: [] });

      }

      return userHistory.chats;

    } catch (error) {

      console.error("Error getting user chats:", error);

      throw error;

    }

  },



  async saveChat(userId, chat) {

    try {

      const userHistory = await ChatHistory.findOne({ userId });

      if (userHistory) {

        const chatIndex = userHistory.chats.findIndex((c) => c.id === chat.id);

        if (chatIndex !== -1) {

          userHistory.chats[chatIndex] = {

            id: chat.id,

            title: chat.title,

            messages: chat.messages.map((msg) => ({

              id: msg.id,

              content: msg.content,

              sender: msg.sender,

              timestamp: msg.timestamp,

              userQuery: msg.userQuery,

              originalQuery: msg.originalQuery || msg.userQuery || msg.content,

            })),

            createdAt: chat.createdAt,

          };

        } else {

          userHistory.chats.push({

            id: chat.id,

            title: chat.title,

            messages: chat.messages.map((msg) => ({

              id: msg.id,

              content: msg.content,

              sender: msg.sender,

              timestamp: msg.timestamp,

              userQuery: msg.userQuery,

              originalQuery: msg.originalQuery || msg.userQuery || msg.content,

            })),

            createdAt: chat.createdAt,

          });

        }

        await userHistory.save();

      } else {

        await ChatHistory.create({

          userId,

          chats: [

            {

              id: chat.id,

              title: chat.title,

              messages: chat.messages.map((msg) => ({

                id: msg.id,

                content: msg.content,

                sender: msg.sender,

                timestamp: msg.timestamp,

                userQuery: msg.userQuery,

                originalQuery:

                  msg.originalQuery || msg.userQuery || msg.content,

              })),

              createdAt: chat.createdAt,

            },

          ],

        });

      }

    } catch (error) {

      console.error("Error saving chat:", error);

      throw error;

    }

  },



  async deleteChat(userId, chatId) {

    try {

      await ChatHistory.updateOne(

        { userId },

        { $pull: { chats: { id: chatId } } }

      );

    } catch (error) {

      console.error("Error deleting chat:", error);

      throw error;

    }

  },



  async clearAllChats(userId) {

    try {

      await ChatHistory.updateOne({ userId }, { $set: { chats: [] } });

    } catch (error) {

      console.error("Error clearing chats:", error);

      throw error;

    }

  },



  async updateChatTitle(userId, chatId, newTitle) {

    try {

      const userHistory = await ChatHistory.findOne({ userId });

      if (userHistory) {

        const chatIndex = userHistory.chats.findIndex(c => c.id === chatId);

        if (chatIndex !== -1) {

          userHistory.chats[chatIndex].title = newTitle;

          await userHistory.save();

        }

      }

    } catch (error) {

      console.error('Error updating chat title:', error);

      throw error;

    }

  }

};


