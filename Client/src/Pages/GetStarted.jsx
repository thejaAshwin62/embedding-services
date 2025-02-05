import React, { useEffect } from "react";
import Glass1 from "../assets/Glasses1.png";
import Glass2 from "../assets/Glasses2.png";
import Glass3 from "../assets/Glasses3.png";
import { Link } from "react-router-dom";

const GetStarted = () => {


  // const showToast = (message) => {
  //   const toast = document.createElement("div");
  //   toast.className = "toast toast-end";
  //   toast.innerHTML = `
  //     <div class="alert alert-info">
  //       <span>${message}</span>
  //     </div>
  //   `;
  //   document.body.appendChild(toast);

  //   setTimeout(() => {
  //     toast.style.opacity = "0";
  //     setTimeout(() => {
  //       document.body.removeChild(toast);
  //     }, 300);
  //   }, 2700);
  // };

  // useEffect(() => {
  //   // Show toast when component mounts
  //   showToast("Successfully signed in!");
  // }, []);

  return (
    <section className="min-h-screen bg-primary-100 flex justify-center px-4 sm:px-6 md:px-5 ">
      <div className="max-w-7xl w-full">
        <div className="max-w-3xl mx-auto text-center mb-2 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-950 leading-tight mb-4">
            Discover How Our Camera Transforms Your Experience
          </h1>
          <p className="text-secondary-950 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-7">
            Our innovative camera captures your surroundings every 15 seconds,
            converting visual data into actionable text. This allows you to
            interact with your environment like never before.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6">
          <Link
            to="/get-started/setup-camera"
            className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 h-full"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="aspect-video overflow-hidden">
                <img
                  src={Glass1}
                  alt="Glass1"
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-950 mb-2">
                  Step 1: Set Up Your Camera
                </h2>
                <p className="text-secondary-950 text-xs sm:text-sm md:text-base">
                  Simply charge your camera and connect it to your device.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/get-started/start-recording"
            className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 h-full"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="aspect-video overflow-hidden">
                <img
                  src={Glass2}
                  alt="Glass2"
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-950 mb-2">
                  Step 2: Start Recording Your Journey
                </h2>
                <p className="text-secondary-950 text-xs sm:text-sm md:text-base">
                  Press the record button to begin capturing data.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/get-started/chatbot"
            className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 h-full"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="aspect-video overflow-hidden">
                <img
                  src={Glass3}
                  alt="Glass3"
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between relative">
                <div className="absolute inset-0 bg-primary-50 transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100 -z-10"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-950 mb-2 relative z-10">
                  Step 3: Ask Your Questions
                </h2>
                <p className="text-secondary-950 text-xs sm:text-sm md:text-base relative z-10">
                  Use the chatbot feature to inquire about your location and
                  more.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
