import React, { useEffect, useRef } from "react";
import Glass1 from "../assets/Glasses1.png";
import Glass2 from "../assets/Glasses2.png";
import Glass3 from "../assets/Glasses3.png";
import { Link } from "react-router-dom";
import { BackgroundGradient } from "../ui/background-gradient";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { CardContainer, CardBody, CardItem } from "../ui/3d-card";
import { SparklesCore } from "../ui/sparkles";

const GetStarted = () => {
  const containerRef = useRef(null);

  // Words for typewriter effect
  const words = [
    { text: "Discover" },
    { text: "How" },
    { text: "Our" },
    { text: "Camera", className: "text-blue-500" },
    { text: "Transforms", className: "text-blue-500" },
    { text: "Your" },
    { text: "Experience" },
  ];

  // Steps data
  const steps = [
    {
      id: 1,
      title: "Set Up Your Camera",
      description: "Simply charge your camera and connect it to your device.",
      image: Glass1,
      path: "/get-started/setup-camera",
    },
    {
      id: 2,
      title: "Start Recording Your Journey",
      description: "Press the record button to begin capturing data.",
      image: Glass2,
      path: "/get-started/start-recording",
    },
    {
      id: 3,
      title: "Ask Your Questions",
      description: "Use the chatbot feature to inquire about your location and more.",
      image: Glass3,
      path: "/get-started/chatbot",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex justify-center px-4 sm:px-6 md:px-5 py-12 relative overflow-hidden">
      {/* Sparkles Background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <SparklesCore
          id="sparkles"
          background="transparent"
          minSize={1}
          maxSize={3}
          particleDensity={30}
          particleColor="#B8860B"
          particleSpeed={0.2}
        />
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 px-4 sm:px-6">
          {/* Animated title with typewriter effect */}
          <div className="mb-6">
            <TypewriterEffect words={words} className="text-3xl sm:text-4xl md:text-5xl" />
          </div>
          
          <BackgroundGradient className="p-1 rounded-2xl mb-8">
            <div className="bg-white/90 p-4 rounded-xl">
              <p className="text-secondary-950 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                Our innovative camera captures your surroundings every 15 seconds,
                converting visual data into actionable text. This allows you to
                interact with your environment like never before.
              </p>
            </div>
          </BackgroundGradient>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 px-4 sm:px-6">
          {steps.map((step) => (
            <Link
              key={step.id}
              to={step.path}
              className="block h-full"
            >
              <CardContainer className="w-full h-full">
                <CardBody className="bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
                  <CardItem translateZ={80} className="w-full">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={step.image || "/placeholder.svg"}
                        alt={`Step ${step.id}`}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </CardItem>
                  
                  <CardItem translateZ={80} className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                          {step.id}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-primary-950">
                          Step {step.id}: {step.title}
                        </h2>
                      </div>
                      <p className="text-secondary-950 text-sm sm:text-base">
                        {step.description}
                      </p>
                    </div>
                    
                    <CardItem translateZ={100} className="mt-4">
                      <div className="bg-blue-500 text-white py-2 px-4 rounded-lg text-center transform transition-transform duration-300 group-hover:scale-105">
                        Get Started
                      </div>
                    </CardItem>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </Link>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <BackgroundGradient className="inline-block p-1 rounded-xl">
            <div className="bg-white/90 px-8 py-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Ready to transform your experience?</h3>
              <p className="text-gray-600 mb-4">Follow these simple steps to get started with your new camera.</p>
              <Link to="/get-started/setup-camera">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Begin Your Journey
                </button>
              </Link>
            </div>
          </BackgroundGradient>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
