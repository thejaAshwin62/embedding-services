import { useState, useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import HeroImage from "../assets/sample.png"
import { TypewriterEffect } from "../ui/typewriter-effect"
import { BackgroundGradient } from "../ui/background-gradient"
import { SparklesCore } from "../ui/sparkles"
import { CardContainer, CardBody, CardItem } from "../ui/3d-card"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../ui/hover-card"
import "../ui/animations.css"
import Footer from "../Componenets/Footer"

const Hero = () => {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAuthAction = () => {
    if (isSignedIn) {
      navigate("/get-started")
    } else {
      navigate("/sign-in")
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setIsValidEmail(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setIsValidEmail(false)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      setEmail("")

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1500)
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Designer",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      text: "This camera has completely changed how I document my daily experiences. The insights I get are incredible!",
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      text: "Being able to ask questions about my surroundings and get instant answers has been a game-changer for my work.",
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      text: "The 15-second capture interval is perfect - not too intrusive but comprehensive enough to be useful.",
    },
    {
      name: "David Kim",
      role: "Research Scientist",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      text: "I've been using this for my research and the data insights have accelerated my work tremendously.",
    },
  ]

  const features = [
    {
      name: "15-Minutes Capture",
      description: "Automatic visual data collection at perfect intervals",
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "AI Analysis",
      description: "Transforms images into actionable insights instantly",
      icon: (
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
      ),
    },
    {
      name: "Chatbot Interface",
      description: "Ask questions about your surroundings naturally",
      icon: (
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      name: "Instant Answers",
      description: "Get immediate responses about your location",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ]

  const words = [
    { text: "Capture." },
    { text: "Analyze." },
    { text: "Understand." },
    { text: "Your", className: "text-blue-500" },
    { text: "World", className: "text-blue-500" },
  ]

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <SparklesCore
            id="sparkles"
            background="transparent"
            minSize={1}
            maxSize={4}
            particleDensity={35}
            particleColor="#3b82f6"
            particleSpeed={0.4}
          />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-5 max-w-7xl">
       

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content - 7 columns on large screens */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-block">
                <BackgroundGradient className="p-[1px] rounded-full">
                  <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm">
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Revolutionary Camera Technology
                    </span>
                  </div>
                </BackgroundGradient>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900">
                <span className="block mb-2">Transform Visual Data</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Into Actionable Insights
                </span>
              </h1>

              <div className="py-4">
                <TypewriterEffect words={words} className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>

              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl">
                Our innovative camera captures your surroundings every 15 minutes, transforming visual data into
                actionable insights. With its chatbot functionality, you can easily ask questions and receive instant
                answers about your location and activities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <Link to="https://www.espressif.com/en/products/socs/esp32" target="_blank" rel="noopener noreferrer">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1">
                  Learn More
                </button>
              </Link>
              <button
                onClick={handleAuthAction}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 transition-all border border-slate-200 text-slate-900 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {isSignedIn ? "Get Started" : "Explore Now"}
              </button>
            </motion.div>

            {/* Email subscription form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 max-w-md"
            >
              {/* <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Get early access to our beta
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 rounded-xl bg-white border ${
                      isValidEmail ? "border-slate-200 focus:border-blue-500" : "border-red-500"
                    } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        <span>Submitting</span>
                      </div>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {!isValidEmail && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      Please enter a valid email address
                    </motion.p>
                  )}
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Thanks for subscribing! We'll be in touch soon.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form> */}
            </motion.div>
          </div>

          {/* Right Content - 5 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <CardContainer className="w-full max-w-md h-auto">
              <CardBody className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-2xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full"></div>

                <CardItem translateZ={50} className="w-full h-full p-6">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
                    <img
                      src={HeroImage || "/placeholder.svg"}
                      alt="Camera in action"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">MindSync Camera</h3>
                    <p className="text-slate-600">
                      Capture moments
                    </p>

                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">4.9 (128 reviews)</span>
                    </div>
                  </div>
                </CardItem>

                <CardItem translateZ={100} translateX={-40} translateY={-40} className="absolute top-0 left-0">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
                    <h3 className="text-sm font-medium text-slate-900 flex items-center">
                      <div className="w-3 h-3 bg-red-800 rounded-full mr-2 animate-pulse"></div>
                      <span className="">Capturing...</span>
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-600">Every 15 minutes</span>
                    </div>
                  </div>
                </CardItem>

                <CardItem translateZ={80} translateX={40} translateY={40} className="absolute bottom-0 right-0">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg max-w-[200px]">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs text-white">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">
                        You're at a cozy coffee shop, sipping drinks and sharing laughs with your friend Kratos 
                        </p>
                      </div>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </motion.div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our camera combines cutting-edge hardware with intelligent software to deliver an unparalleled experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <HoverCard>
                  <HoverCardTrigger>
                    <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all cursor-pointer border border-slate-200 shadow-lg hover:shadow-xl group h-full">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-xl text-slate-900 mb-2">{feature.name}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white border-slate-200 text-slate-900 p-4 shadow-xl rounded-xl w-80">
                    <div className="space-y-6">
                      <h4 className="font-bold text-lg">{feature.name}</h4>
                      <p className="text-slate-600">{feature.description}</p>
                      <div className="pt-2 border-t border-slate-100 ">
                        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                          Learn more
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        {/* <div id="testimonials" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Thousands of users are already transforming how they capture and understand their world.
            </p>
          </div>

          <div className="h-60">
            <InfiniteMovingCards
              items={testimonials.map((testimonial) => ({
                ...testimonial,
                content: (
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                        <p className="text-sm text-slate-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-slate-700">{testimonial.text}</p>
                  </div>
                ),
              }))}
              direction="left"
              speed="slow"
              className="py-4"
            />
          </div>
        </div> */}

        {/* Call to Action */}
        <div id="pricing" className="mt-32 text-center">
          <BackgroundGradient className="inline-block p-[1px] rounded-2xl">
            <div className="px-8 py-10 sm:px-12 sm:py-16 rounded-2xl bg-white/90 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">
                  Ready to transform how you capture your world?
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 mb-8">
                  Join thousands of users already experiencing the future of visual insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleAuthAction}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1"
                  >
                    {isSignedIn ? "Get Started Now" : "Start Your Journey"}
                  </button>
                 
                </div>
              </motion.div>
            </div>
          </BackgroundGradient>
        </div>

        {/* Footer */}
       <Footer/>
      </div>
    </section>
  )
}

export default Hero

