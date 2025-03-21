import { useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { useChat } from "../Context/ChatContext"
import LoadingScreen from "../Componenets/LoadingScreen"
import useLoadingDelay from "../hooks/useLoadingDelay"
import LocationMap from "../Componenets/LocationMap"
import LocationTimeline from "../Componenets/LocationTimeline"
import { motion, AnimatePresence } from "framer-motion"
import { BackgroundGradient } from "../ui/background-gradient"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../ui/hover-card"
import { SparklesCore } from "../ui/sparkles"
import { InfiniteMovingCards } from "../ui/infinite-moving-cards"
import "leaflet/dist/leaflet.css"

const Dashboard = () => {
  const { user } = useUser()
  const { aiName, setAiName, userName, setUserName } = useChat()
  const [isEditingAI, setIsEditingAI] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [tempAIName, setTempAIName] = useState(aiName)
  const [tempUserName, setTempUserName] = useState(userName)
  const isLoading = useLoadingDelay()
  const [isSavingAI, setIsSavingAI] = useState(false)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [activeTab, setActiveTab] = useState("locations")

  // Sample testimonials for the moving cards
  const testimonials = [
    {
      name: "Today at Coffee Shop",
      text: "Captured 24 images while working on your project. Asked about nearby lunch options.",
    },
    {
      name: "Yesterday at Park",
      text: "Recorded 45 images during your morning walk. Identified 3 different bird species.",
    },
    {
      name: "Last Week at Office",
      text: "Documented 120 images during meetings. Helped you remember key discussion points.",
    },
    {
      name: "Two Weeks Ago",
      text: "Captured 200+ images during your vacation. Created a visual diary of your trip.",
    },
  ]

  if (isLoading) {
    return <LoadingScreen />
  }

  const handleAINameSave = async () => {
    if (tempAIName.trim()) {
      setIsSavingAI(true)
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAiName(tempAIName.trim())
        setIsEditingAI(false)
      } finally {
        setIsSavingAI(false)
      }
    }
  }

  const handleUserNameSave = async () => {
    if (tempUserName.trim()) {
      setIsSavingUser(true)
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setUserName(tempUserName.trim())
        setIsEditingUser(false)
      } finally {
        setIsSavingUser(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-2 sm:p-4 md:p-10 pt-2 md:pt-4 relative">
      {/* Subtle sparkles background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <SparklesCore
          id="dashboard-sparkles"
          background="transparent"
          minSize={0.2}
          maxSize={0.8}
          particleDensity={20}
          particleColor="#4f46e5"
          particleSpeed={0.1}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-100"
        >
          {/* Header with user info */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src={user?.imageUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-4 border-white/30"
                />
                <a
                  href="https://myaccount.google.com/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                  title="Change Profile Picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                </a>
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome to your Dashboard!
                </motion.h1>
                <motion.p
                  className="text-blue-100 text-sm sm:text-base break-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user?.emailAddresses[0].emailAddress}
                </motion.p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personalization Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1"
              >
                <BackgroundGradient className="rounded-xl p-[1px]">
                  <div className="bg-white p-6 rounded-xl h-full">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Personalization
                    </h3>

                    {/* User Name Setting */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Display Name</label>
                      <AnimatePresence mode="wait">
                        {isEditingUser ? (
                          <motion.div
                            key="editing-user"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              value={tempUserName}
                              onChange={(e) => setTempUserName(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 focus:bg-white text-black placeholder-gray-500 px-3 py-2"
                              disabled={isSavingUser}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUserNameSave}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-1 sm:flex-none min-w-[80px] transition-colors"
                                disabled={isSavingUser}
                              >
                                {isSavingUser ? (
                                  <span className="flex justify-center items-center">
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingUser(false)
                                  setTempUserName(userName)
                                }}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex-1 sm:flex-none transition-colors"
                                disabled={isSavingUser}
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="display-user"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-gray-800 font-medium">{userName}</span>
                            <button
                              onClick={() => setIsEditingUser(true)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AI Assistant Name Setting */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Assistant Name</label>
                      <AnimatePresence mode="wait">
                        {isEditingAI ? (
                          <motion.div
                            key="editing-ai"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              value={tempAIName}
                              onChange={(e) => setTempAIName(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 focus:bg-white text-black placeholder-gray-500 px-3 py-2"
                              disabled={isSavingAI}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleAINameSave}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-1 sm:flex-none min-w-[80px] transition-colors"
                                disabled={isSavingAI}
                              >
                                {isSavingAI ? (
                                  <span className="flex justify-center items-center">
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingAI(false)
                                  setTempAIName(aiName)
                                }}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex-1 sm:flex-none transition-colors"
                                disabled={isSavingAI}
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="display-ai"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-gray-800 font-medium">{aiName}</span>
                            <button
                              onClick={() => setIsEditingAI(true)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">Total Captures</h3>
                            <p className="text-3xl font-bold">1,248</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-white/20 h-2 rounded-full">
                            <div className="bg-white h-2 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                          <p className="text-xs mt-1 text-blue-100">75% more than last month</p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white p-4 shadow-xl">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Capture Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            Today: <span className="font-medium">42</span>
                          </div>
                          <div>
                            This Week: <span className="font-medium">287</span>
                          </div>
                          <div>
                            This Month: <span className="font-medium">1,024</span>
                          </div>
                          <div>
                            Last Month: <span className="font-medium">896</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">Insights Generated</h3>
                            <p className="text-3xl font-bold">324</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-white/20 h-2 rounded-full">
                            <div className="bg-white h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                          <p className="text-xs mt-1 text-purple-100">60% of captures analyzed</p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white p-4 shadow-xl">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Top Insights Categories</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Locations</span>
                            <span className="font-medium">142</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Objects</span>
                            <span className="font-medium">98</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Activities</span>
                            <span className="font-medium">84</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </motion.div>
            </div>

            {/* Tabs for Map and Timeline */}
            <div className="mt-8">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("locations")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "locations"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } transition-colors`}
                  >
                    Memory Locations
                  </button>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "timeline"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } transition-colors`}
                  >
                    Memory Timeline
                  </button>
                </nav>
              </div>

              {/* Map Section */}
              <AnimatePresence mode="wait">
                {activeTab === "locations" && (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Memory Locations
                      </h3>
                    </div>
                    <div className="h-[400px] relative">
                      <LocationMap />
                    </div>
                  </motion.div>
                )}

                {/* Timeline Section */}
                {activeTab === "timeline" && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Memory Timeline
                      </h3>
                    </div>
                    <LocationTimeline />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Memory Highlights */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Memory Highlights
              </h3>
              <div className="h-48 overflow-hidden">
                <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

