import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "../Context/ChatContext";
import LoadingScreen from "../Componenets/LoadingScreen";
import useLoadingDelay from "../hooks/useLoadingDelay";
import LocationMap from "../Componenets/LocationMap";
import LocationTimeline from "../Componenets/LocationTimeline";
import "leaflet/dist/leaflet.css";

const Dashboard = () => {
  const { user } = useUser();
  const { aiName, setAiName, userName, setUserName } = useChat();
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempAIName, setTempAIName] = useState(aiName);
  const [tempUserName, setTempUserName] = useState(userName);
  const isLoading = useLoadingDelay();
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleAINameSave = async () => {
    if (tempAIName.trim()) {
      setIsSavingAI(true);
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAiName(tempAIName.trim());
        setIsEditingAI(false);
      } finally {
        setIsSavingAI(false);
      }
    }
  };

  const handleUserNameSave = async () => {
    if (tempUserName.trim()) {
      setIsSavingUser(true);
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUserName(tempUserName.trim());
        setIsEditingUser(false);
      } finally {
        setIsSavingUser(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-100 p-2 sm:p-4 md:p-10 pt-2 md:pt-0 ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-primary-50 rounded-lg  p-3 sm:p-4 md:p-6">
          {/* Overlay */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pl-3  md:pl-6">
            <div className="relative">
              <img
                src={user?.imageUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
              <a
                href="https://myaccount.google.com/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-2 -right-2 bg-primary-950 text-white p-1 rounded-full hover:bg-primary-800 transition-colors"
                title="Change Profile Picture"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </a>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-950">
                Welcome to your Dashboard!
              </h1>
              <p className="text-secondary-600 text-sm sm:text-base break-all">
                {user?.emailAddresses[0].emailAddress}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Name Settings */}
            <div className="bg-primary-50 p-3 sm:p-4 md:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-primary-950 mb-4">
                Personalization
              </h3>

              {/* User Name Setting */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Display Name
                </label>
                {isEditingUser ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => setTempUserName(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500 focus:bg-white text-black placeholder-gray-500 px-3 py-2"
                      disabled={isSavingUser}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUserNameSave}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex-1 sm:flex-none min-w-[80px]"
                        disabled={isSavingUser}
                      >
                        {isSavingUser ? (
                          <span className="loading loading-ball loading-sm"></span>
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUser(false);
                          setTempUserName(userName);
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex-1 sm:flex-none"
                        disabled={isSavingUser}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">{userName}</span>
                    <button
                      onClick={() => setIsEditingUser(true)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* AI Assistant Name Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Assistant Name
                </label>
                {isEditingAI ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={tempAIName}
                      onChange={(e) => setTempAIName(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500 focus:bg-white text-black placeholder-gray-500 px-3 py-2"
                      disabled={isSavingAI}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAINameSave}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex-1 sm:flex-none min-w-[80px]"
                        disabled={isSavingAI}
                      >
                        {isSavingAI ? (
                          <span className="loading loading-ball loading-sm"></span>
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingAI(false);
                          setTempAIName(aiName);
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex-1 sm:flex-none"
                        disabled={isSavingAI}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">{aiName}</span>
                    <button
                      onClick={() => setIsEditingAI(true)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section - Fixed height */}
          <div className="bg-primary-50 p-3 sm:p-4 md:p-6 rounded-lg mt-6">
            <h3 className="text-base sm:text-2xl font-semibold text-primary-950 mb-4">
              Memory Locations
            </h3>
            <div className="h-[400px] relative">
              <LocationMap />
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-primary-50 p-3 sm:p-4 md:p-6 rounded-lg mt-6">
            <h3 className="text-base sm:text-2xl font-semibold text-primary-950 mb-4">
              Memory Timeline
            </h3>
            <LocationTimeline />
          </div>
         </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
