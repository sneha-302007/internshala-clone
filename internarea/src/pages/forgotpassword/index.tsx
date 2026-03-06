import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { generatePassword } from "@/utils/passwordGenerator";
import Link from "next/link";

const ONE_DAY = 24 * 60 * 60 * 1000;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const getStorageKey = (email: string) =>
    `passwordReset:${email.toLowerCase()}`;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const key = getStorageKey(email);
    const lastRequest = localStorage.getItem(key);

    // ✅ Check per-email limit
    if (lastRequest && Date.now() - Number(lastRequest) < ONE_DAY) {
      toast.warning(
        "You can reset password for this email only once in 24 hours"
      );
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      // ✅ Save timestamp PER EMAIL
      localStorage.setItem(key, Date.now().toString());

      const suggestedPassword = generatePassword();

      toast.success("Password reset email sent");
      toast.info(`Suggested password: ${suggestedPassword}`, {
        autoClose: false,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your registered email
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          Remember password?{" "}
          <Link href="/userlogin" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
