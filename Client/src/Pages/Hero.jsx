import React from "react";
import HeroImage from "../assets/sample.png";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

const Hero = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const images = [
    { id: 1, src: HeroImage },
    { id: 2, src: HeroImage },
    { id: 3, src: HeroImage },
    { id: 4, src: HeroImage },
    { id: 5, src: HeroImage },
    { id: 6, src: HeroImage },
  ];

  const handleAuthAction = () => {
    if (isSignedIn) {
      navigate('/get-started');
    } else {
      navigate('/sign-in');
    }
  };

  return (
    <section className="px-4 sm:px-6 md:px-10 h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-10 w-full h-full">
        {/* Left content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left pt-8 lg:pt-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-950 leading-tight">
            Revolutionize Your Experience with Smart Recording
          </h1>
          <p className="text-secondary-950 mt-6 lg:mt-10 text-base lg:text-lg px-4 lg:px-0">
            Our innovative camera captures your surroundings every 15 seconds,
            transforming visual data into actionable insights. With its chatbot
            functionality, you can easily ask questions and receive instant
            answers about your location and activities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-10 mt-6 lg:mt-10">
            <Link to="/learn-more">
              <button className="bg-primary-950 text-white px-6 py-2.5 rounded-md hover:bg-primary-800 transition-colors">
                Learn More
              </button>
            </Link>
            <Link to="/get-started">
              <button
                onClick={handleAuthAction}
                className="bg-primary-950 text-white px-6 py-2.5 rounded-md hover:bg-primary-800 transition-colors"
              >
                Explore
              </button>
            </Link>
          </div>
        </div>

        {/* Right content - Dual Image carousel */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full overflow-hidden mt-8 lg:mt-0 flex gap-3 md:gap-4">
          {/* First Column - Moving Up */}
          <div className="w-1/2 overflow-hidden">
            <div className="grid grid-cols-1 gap-3 md:gap-4 animate-scroll-up">
              {images.map((image) => (
                <div
                  key={`up-${image.id}`}
                  className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image.src}
                    alt={`Carousel image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-opacity duration-300"></div>
                </div>
              ))}
              {/* Duplicate images for seamless loop */}
              {images.map((image) => (
                <div
                  key={`up-duplicate-${image.id}`}
                  className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image.src}
                    alt={`Carousel image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Column - Moving Down */}
          <div className="w-1/2 overflow-hidden">
            <div className="grid grid-cols-1 gap-3 md:gap-4 animate-scroll-down">
              {images.map((image) => (
                <div
                  key={`down-${image.id}`}
                  className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image.src}
                    alt={`Carousel image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-opacity duration-300"></div>
                </div>
              ))}
              {/* Duplicate images for seamless loop */}
              {images.map((image) => (
                <div
                  key={`down-duplicate-${image.id}`}
                  className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image.src}
                    alt={`Carousel image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
