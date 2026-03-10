import React, { useState } from "react";
import { auth, provider } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useContext } from "react";
import { LanguageContext } from "@/utils/LanguageContext";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { language, changeLanguage, translations } =
    useContext(LanguageContext);

  const t = (key: string): string => {
    return (
      key.split(".").reduce((obj: any, i: string) => {
        return obj?.[i];
      }, translations) || key
    );
  };

  // Email Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await syncUser(result.user);

      toast.success(t("usersignup.accountCreatedSuccess"));
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);

      await syncUser(result.user);

      toast.success(t("usersignup.signedUpWithGoogle"));
      router.push("/");
    } catch (error) {
      toast.error(t("usersignup.googleSignupFailed"));
    } finally {
      setLoading(false);
    }
  };
  const syncUser = async (firebaseUser: any) => {
    await axios.post(
      "https://internshala-clone-xhqv.onrender.com/api/users/sync",
      {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        profilePhoto: firebaseUser.photoURL || "",
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {t("usersignup.title")}
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder={t("usersignup.email")}
            className="w-full border rounded-lg px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder={t("usersignup.password")}
            className="w-full border rounded-lg px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {t("usersignup.createAccount")}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">
          {t("usersignup.or")}
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full border py-2 rounded-lg hover:bg-gray-50"
        >
          {t("usersignup.continueWithGoogle")}
        </button>

        <p className="text-sm text-center mt-4">
          {t("usersignup.alreadyHaveAccount")}{" "}
          <Link href="/userlogin" className="text-blue-600">
            {t("usersignup.login")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
