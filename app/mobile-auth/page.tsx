"use client";

import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function MobileAuthPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleAuthorize = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (idToken) {
        // Read redirect parameter from the URL, fall back to default scheme if not present
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get("redirect") || "discussapp://login";

        const separator = redirectParam.includes("?") ? "&" : "?";
        const url = `${redirectParam}${separator}idToken=${encodeURIComponent(idToken)}`;
        
        setRedirectUrl(url);
        setStatus("success");
        // Trigger automatic redirect
        window.location.href = url;
      } else {
        throw new Error("Could not retrieve Google ID Token. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "An error occurred during authentication.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full border border-black/10 dark:border-white/10 p-8 rounded-2xl shadow-xl bg-black/5 dark:bg-white/5 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-center">
          Discuss App Authorization
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6 text-center">
          Authorize your Google account to log in to the Discuss mobile application.
        </p>

        {status === "idle" && (
          <button
            onClick={handleAuthorize}
            className="w-full py-3 px-4 font-bold text-white bg-black dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-center shadow-lg"
          >
            Authorize with Google
          </button>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-black/15 dark:border-white/15 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium opacity-70">Authenticating...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              ✓
            </div>
            <p className="text-sm font-semibold text-green-500 mb-2">Authenticated Successfully!</p>
            <p className="text-xs text-black/60 dark:text-white/60 mb-6">
              You are being redirected back to the app...
            </p>
            {redirectUrl && (
              <a
                href={redirectUrl}
                className="text-xs text-blue-500 underline font-medium hover:opacity-85"
              >
                Click here if you are not automatically redirected
              </a>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              !
            </div>
            <p className="text-sm font-semibold text-red-500 mb-2">Authorization Failed</p>
            <p className="text-xs text-red-500/80 mb-6 max-h-24 overflow-y-auto px-2">
              {errorMsg}
            </p>
            <button
              onClick={handleAuthorize}
              className="w-full py-2.5 px-4 font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity cursor-pointer text-center"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
