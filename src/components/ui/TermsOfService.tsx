"use client"

import React from "react"

export default function TermsOfService() {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full px-6 py-10 
                    bg-white text-black dark:bg-black dark:text-white rounded-lg space-y-10">

      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-extrabold text-black dark:text-white tracking-tight">
          Lupyd
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
          Terms of Service
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl text-left space-y-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Welcome to <strong>Lupyd</strong>. By accessing or using our platform, you agree to be bound by these Terms of Service. 
          Please read them carefully before using any Lupyd service or feature.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          By registering, accessing, or using Lupyd, you confirm that you accept these terms. 
          If you do not agree, you may not use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. User Responsibilities</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          You agree to use Lupyd responsibly, without violating any applicable laws. 
          You must not misuse, hack, or attempt unauthorized access to any part of our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Privacy & Data</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Your privacy is important to us. All data collected is handled securely and in accordance 
          with our <a href="/PrivacyPolicy" className="underline hover:text-gray-500">Privacy Policy</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Limitation of Liability</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Lupyd is not liable for any indirect, incidental, or consequential damages resulting from 
          the use or inability to use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Updates to Terms</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Lupyd may modify these Terms of Service from time to time. 
          Continued use of our platform means you accept the updated terms.
        </p>

        <p className="text-gray-600 dark:text-gray-400 italic mt-8">
          Last updated: October 2025
        </p>
      </div>

     
    </div>
  )
}
