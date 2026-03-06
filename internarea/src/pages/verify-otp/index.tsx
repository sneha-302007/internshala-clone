"use client";

import React, { FormEvent, useState } from "react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/resume/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/resume-payment";
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Verify OTP
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter the OTP sent to your registered email
        </p>

        <form onSubmit={handleVerify} className="space-y-5">

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full text-center tracking-widest px-4 py-3
                       border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        <div className="text-center mt-4">
          <button
            className="text-indigo-600 text-sm hover:underline"
            onClick={() => alert("Resend OTP feature coming soon")}
          >
            Resend OTP
          </button>
        </div>

      </div>
    </div>
  );
}
