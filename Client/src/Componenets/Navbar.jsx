import React, { useState } from "react";
import Logo from "../assets/Logo.svg";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message) => {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast toast-end";
    toast.style.zIndex = "9999";
    toast.innerHTML = `
      <div class="alert alert-info">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds with fade effect
    setTimeout(() => {
      toast.style.transition = "opacity 0.5s ease-out";
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 3000);
  };

  const handleAuthAction = async () => {
    if (isSignedIn) {
      try {
        setIsLoading(true);
        navigate("/", { replace: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
        showToast("Successfully signed out!");
        await new Promise((resolve) => setTimeout(resolve, 100));
        await signOut();
      } catch (error) {
        showToast("Error signing out. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      navigate("/sign-in");
    }
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      // Show logo after 1 second when menu opens
      setTimeout(() => {
        setIsLogoVisible(true);
      }, 250);
    } else {
      // Immediately hide logo and close menu
      setTimeout(() => {
        setIsLogoVisible(false);
      }, 100);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <section className="fixed top-0 left-0 right-0 bg-white z-[1000] min-h-[64px] ">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <img src={Logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
                <span className="text-lg font-bold text-slate-900">MindSync</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-secondary-950"
              onClick={handleMenuToggle}
            >
              {!isMenuOpen ? (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10 ">
              <ul className="flex gap-10 text-secondary-950 ">
                <Link to="/">
                  <li className="hover:text-secondary-600 cursor-pointer transition-colors">
                    Home
                  </li>
                </Link>
                <Link to="/about">
                  <li className="hover:text-secondary-600 cursor-pointer transition-colors">
                    About
                  </li>
                </Link>
                <Link to="/contact">
                  <li className="hover:text-secondary-600 cursor-pointer transition-colors">
                    Contact
                  </li>
                </Link>
                <Link to="/dashboard">
                  <li className="hover:text-secondary-600 cursor-pointer transition-colors">
                    Dashboard
                  </li>
                </Link>
              </ul>
              <button
                onClick={handleAuthAction}
                className="bg-primary-950 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors min-w-[100px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-ball loading-sm"></span>
                ) : isSignedIn ? (
                  "Sign Out"
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Mobile Navigation */}
            <div
              className={`
                lg:hidden fixed inset-0 bg-white z-50 transition-transform duration-300 ease-in-out
                ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              {/* Close button and Logo container */}
              <div className="flex justify-between items-center p-4 border-b">
                {/* Logo with transition */}
                <div
                  className={`transition-opacity duration-500 ${
                    isLogoVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Link to="/">
                    <img src={Logo} alt="Logo" className="h-8 w-8" />
                  </Link>
                </div>
                <button
                  className="text-secondary-950 p-2 hover:bg-gray-100 rounded-full"
                  onClick={handleMenuToggle}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col h-full px-4 pt-6">
                <ul className="flex flex-col gap-6 text-secondary-950 text-lg items-center">
                  <Link to="/" onClick={handleMenuToggle}>
                    <li className="hover:text-secondary-600 cursor-pointer transition-colors p-2">
                      Home
                    </li>
                  </Link>
                  <Link to="/about" onClick={handleMenuToggle}>
                    <li className="hover:text-secondary-600 cursor-pointer transition-colors p-2">
                      About
                    </li>
                  </Link>
                  <Link to="/contact" onClick={handleMenuToggle}>
                    <li className="hover:text-secondary-600 cursor-pointer transition-colors p-2">
                      Contact
                    </li>
                  </Link>
                  <Link to="/dashboard" onClick={handleMenuToggle}>
                    <li className="hover:text-secondary-600 cursor-pointer transition-colors p-2">
                      Dashboard
                    </li>
                  </Link>
                </ul>
                <button
                  onClick={() => {
                    handleAuthAction();
                    handleMenuToggle();
                  }}
                  className="mt-8 bg-primary-950 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors mx-auto min-w-[100px]"
                >
                  {isSignedIn ? "Sign Out" : "Sign In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Navbar;
