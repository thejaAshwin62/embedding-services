import { useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BackgroundGradient } from "../ui/background-gradient"
import { SparklesCore } from "../ui/sparkles"
import { CardContainer, CardBody, CardItem } from "../ui/3d-card"
import { TypewriterEffect } from "../ui/typewriter-effect"

const About = () => {
  const containerRef = useRef(null)

  // Words for typewriter effect
  const words = [
    { text: "About" },
    { text: "Our" },
    { text: "Vision" },
    { text: "And" },
    { text: "Journey", className: "text-blue-500" },
  ]

  // Team members data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Visionary leader with 15+ years in camera technology and AI integration.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Sarah Chen",
      role: "Chief Technology Officer",
      bio: "AI expert specializing in computer vision and machine learning algorithms.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product Design",
      bio: "Award-winning designer focused on creating intuitive user experiences.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Priya Patel",
      role: "VP of Customer Success",
      bio: "Dedicated to ensuring our customers get the most from our technology.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  // Milestones data
  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "MindSync was established with a vision to transform visual data into actionable insights.",
    },
    {
      year: "2021",
      title: "First Prototype",
      description: "Developed our first working prototype with 30-second capture intervals.",
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Secured $12M in Series A funding to accelerate product development and market entry.",
    },
    {
      year: "2023",
      title: "Product Launch",
      description: "Successfully launched our flagship product with improved 15-second capture technology.",
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded operations to Europe and Asia with growing customer base worldwide.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <SparklesCore
            id="about-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.5}
            particleDensity={15}
            particleColor="#3b82f6"
            particleSpeed={0.2}
          />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 max-w-7xl">
        
       

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <TypewriterEffect words={words} className="text-3xl sm:text-4xl md:text-5xl" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed"
          >
            At MindSync, we're revolutionizing how people interact with their surroundings through cutting-edge camera
            technology and AI-powered insights. Our journey began with a simple question: What if your camera could not
            only capture moments but understand them?
          </motion.p>
        </div>

        {/* Our Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-24"
        >
          <BackgroundGradient className="p-[1px] rounded-2xl">
            <div className="bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                  <p className="text-slate-700 mb-6">
                    We believe that visual data is one of the most underutilized resources in our daily lives. Our
                    mission is to transform how people capture, process, and interact with visual information, making it
                    more accessible, insightful, and actionable.
                  </p>
                  <p className="text-slate-700">
                    Through our innovative camera technology, we're building a future where your surroundings become a
                    rich source of information that enhances your decision-making, creativity, and understanding of the
                    world around you.
                  </p>
                </div>
                <div className="relative h-64 sm:h-80 md:h-full rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10 rounded-xl"></div>
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Our mission"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

        {/* Team Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-slate-900 mb-4"
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-lg text-slate-700 max-w-2xl mx-auto"
            >
              Passionate innovators dedicated to transforming how you experience and interact with your world.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <CardContainer className="w-full">
                  <CardBody className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full">
                    <CardItem translateZ={50} className="w-full">
                      <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                      <p className="text-slate-600 text-sm">{member.bio}</p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-slate-900 mb-4"
            >
              Our Journey
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-lg text-slate-700 max-w-2xl mx-auto"
            >
              Key milestones that have shaped our path to innovation and excellence.
            </motion.p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full"></div>

            {/* Timeline items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 md:w-1/2 mb-4 md:mb-0">
                    <BackgroundGradient
                      className={`p-[1px] rounded-xl ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}
                    >
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl h-full">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mb-3">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                        <p className="text-slate-600">{milestone.description}</p>
                      </div>
                    </BackgroundGradient>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-blue-500 z-10"></div>

                  {/* Empty div for layout on alternate sides */}
                  <div className="flex-1 md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <BackgroundGradient className="p-[1px] rounded-2xl">
            <div className="bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Our Core Values</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Innovation</h3>
                  <p className="text-slate-700">
                    We constantly push the boundaries of what's possible, embracing new ideas and technologies to create
                    breakthrough solutions.
                  </p>
                </div>

                <div className="p-6 bg-indigo-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">User-Centered</h3>
                  <p className="text-slate-700">
                    We design with empathy, putting our users' needs, experiences, and feedback at the heart of
                    everything we create.
                  </p>
                </div>

                <div className="p-6 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy & Trust</h3>
                  <p className="text-slate-700">
                    We uphold the highest standards of data privacy and security, ensuring our users can trust us with
                    their information.
                  </p>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Join Our Journey?</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-8">
            Experience the future of visual data capture and analysis with MindSync.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1">
                Get Started
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-4 rounded-xl bg-white hover:bg-slate-50 transition-all border border-slate-200 text-slate-900 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Contact Us
              </button>
            </Link>
          </div>
        </motion.div>

        
        
      </div>
    </div>
  )
}

export default About
