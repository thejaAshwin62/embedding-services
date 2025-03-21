import React from "react";
import "./App.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./Componenets/Navbar";
import Hero from "./Pages/Hero";
import SignIn from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard";
import GetStarted from "./Pages/GetStarted";
import ChatBot from "./Pages/ChatBot";
import SetupCamera from "./Pages/SetupCamera";
import StartRecording from "./Pages/StartRecording";
import { ChatProvider } from "./Context/ChatContext";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import SignUp from "./Pages/SignUp";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-primary-100 main-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route
                path="/sign-in"
                element={
                  <SignedOut>
                    <SignIn />
                  </SignedOut>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <SignedOut>
                    <SignUp />
                  </SignedOut>
                }
              />
              <Route path="/sign-in/sso-callback" element={<SignIn />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route
                path="/get-started/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="chatbot" element={<ChatBot />} />
                      <Route path="setup-camera" element={<SetupCamera />} />
                      <Route
                        path="start-recording"
                        element={<StartRecording />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </ClerkProvider>
  );
};

export default App;
