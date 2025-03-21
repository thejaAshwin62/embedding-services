import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { BackgroundGradient } from "../ui/background-gradient"
import { SparklesCore } from "../ui/sparkles"
import { CardContainer, CardBody, CardItem } from "../ui/3d-card"
import { TypewriterEffect } from "../ui/typewriter-effect"
import Footer from "../Componenets/Footer"
import emailjs from '@emailjs/browser'

const Contact = () => {
  const containerRef = useRef(null)
  const formRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState({})

  // EmailJS configuration
  const serviceId = 'service_nkh3h2o'
  const templateId = 'template_9j52fmf'
  const publicKey = 'H-Pf9nDC3WyS-5kuc'
  const toName = 'Theja Ashwin'
  const toEmail = 'thejaashwin62@gmail.com'

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(publicKey)
  }, [])

  // Words for typewriter effect
  const words = [
    { text: "Get" },
    { text: "In" },
    { text: "Touch" },
    { text: "With", className: "text-blue-500" },
    { text: "Us", className: "text-blue-500" },
  ]

  // Contact information
  const contactInfo = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"contactInfo
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email Us",
      content: "info@mindsync.com",
      link: "mailto:info@mindsync.com",
    },
    {
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Call Us",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Visit Us",
      content: "123 Innovation Drive, San Francisco, CA 94103",
      link: "https://maps.google.com",
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formState.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Email validation
    if (!formState.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Subject validation
    if (!formState.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    // Message validation
    if (!formState.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formState.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      const templateParams = {
        from_name: formState.name,
        to_name: toName,
        from_email: formState.email,
        to_email: toEmail,
        subject: formState.subject,
        message: formState.message,
      }

      try {
        const response = await emailjs.send(
          serviceId,
          templateId,
          templateParams
        )

        console.log('Email sent successfully:', response)
        setShowSuccess(true)
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        })

        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)
      } catch (error) {
        console.error("Error sending email:", error)
        // Show error message
        const errorMessage = document.createElement("div")
        errorMessage.className = "mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
        errorMessage.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>Failed to send message. Please try again.</span>
        `
        const form = document.querySelector("form")
        if (form) {
          form.insertBefore(errorMessage, form.firstChild)
          setTimeout(() => {
            if (errorMessage.parentNode === form) {
              errorMessage.remove()
            }
          }, 5000)
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <SparklesCore
            id="contact-sparkles"
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        {/* Header Section with reduced spacing */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <TypewriterEffect words={words} className="text-3xl sm:text-4xl md:text-5xl font-bold" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed"
          >
            Have questions about our product or services? We'd love to hear from you. Fill out the form below and our
            team will get back to you as soon as possible.
          </motion.p>
        </div>

        {/* Contact Information Cards - Above the form
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {contactInfo.map((item, index) => (
            <CardContainer key={index}>
              <CardBody className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-md hover:shadow-lg transition-all p-6">
                <CardItem translateZ={20} className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <a
                      href={item.link}
                      className="text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {item.content}
                    </a>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form - 8 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-8"
          >
            <BackgroundGradient className="p-[1px] rounded-xl">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
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
                      <span>Your message has been sent successfully! We'll get back to you soon.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${
                          errors.name ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                        } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${
                          errors.email ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                        } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${
                        errors.subject ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                      } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                      placeholder="How can we help you?"
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${
                        errors.message ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                      } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base resize-none`}
                      placeholder="Tell us what you need help with..."
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Right Sidebar - 4 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Social Media Links */}
            <BackgroundGradient className="p-[1px] rounded-xl">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Follow Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="#"
                    className="flex items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">Instagram</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">LinkedIn</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">GitHub</span>
                  </a>
                </div>
              </div>
            </BackgroundGradient>

            {/* Office Hours */}
            <BackgroundGradient className="p-[1px] rounded-xl">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Mind-Sync</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium text-sm">Infinity</span>
                    <span className="font-semibold text-slate-900 text-sm"></span>
                  </li>
                </ul>
              </div>
            </BackgroundGradient>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-base text-slate-700 max-w-2xl mx-auto">
              Find answers to common questions about our products and services.
            </p>
          </div>

          <BackgroundGradient className="p-[1px] rounded-xl">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FAQ items */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">How does the camera capture data?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Our camera automatically captures images every 15 seconds, processing them through our AI system to
                      convert visual data into actionable insights.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Is my data secure and private?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                    Absolutely! We follow strict privacy protocols and use Google Sign-In to keep your data secure. Your captured images are processed instantly — we don't store them anywhere. Your privacy is our top priority.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">How long does the battery last?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                    The ESP32-CAM supports lithium batteries, usually ranging from 1000mAh to 3000mAh. Battery life depends on factors like usage, camera activity, and power-saving modes, making it adaptable for various applications.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Can I integrate with other apps?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                    Yes! We're working on providing API access to make integration with other apps seamless. This will allow you to connect and enhance your workflows effortlessly. Stay tuned for updates!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

       
      </div>

    
    
    </div>
  )
}

export default Contact

