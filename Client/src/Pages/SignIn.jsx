import React from "react";
import { SignIn as ClerkSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [hasShownToast, setHasShownToast] = React.useState(false);

  React.useEffect(() => {
    if (isSignedIn && !hasShownToast) {
      setHasShownToast(true);
      navigate("/get-started", { replace: true });
    }
  }, [isSignedIn, navigate, hasShownToast]);

  return (
    <div className="min-h-screen bg-primary-100 flex items-center justify-center">
      <div className="bg-white mb-10 pb-5 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary-950 text-center mb-3">
          Welcome Back
        </h2>
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              socialButtonsBlockButton:
                "bg-white border-2 border-primary-200 hover:bg-primary-50 transition-colors",
              formButtonPrimary: "bg-primary-950 hover:bg-primary-800",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_URL}
          afterSignInUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL}
          afterSignUpUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL}
          redirectUrl="/sign-in/sso-callback"
        />
      </div>
    </div>
  );
};

export default SignIn;
