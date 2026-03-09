import React, { useState } from "react";
import { auth, provider } from "@/firebase/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { getDeviceInfo } from "@/utils/deviceInfo";
import firebase from "firebase/compat/app";
import { useContext } from "react";
import { LanguageContext } from "@/utils/LanguageContext";

const Login = () => {
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

  const deviceInfo = getDeviceInfo();

  // 🔁 Sync user with backend
  const syncUser = async (firebaseUser: User) => {
    
    const res = await axios.post(
      "https://internshala-clone-xhqv.onrender.com/api/users/sync",
      {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        profilePhoto: firebaseUser.photoURL || "",
        deviceInfo,
      },
    );

    return res.data;
  };

  // 🔵 Google Login
  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const response: any = await syncUser(result.user);
      console.log("SYNC RESPONSE:", response);
      // ✅ Persist login identity
      localStorage.setItem("uid", result.user.uid);
      localStorage.setItem("email", result.user.email || "");
      localStorage.setItem("name", result.user.displayName || "User");

      // clear mobile block on success
      document.cookie = "mobile_blocked=; path=/; max-age=0";

      // ⏳ OTP required
      if (response.status === "OTP_REQUIRED") {
          console.log("OTP REQUIRED - redirecting");

        document.cookie = "otp_pending=true; path=/; max-age=300; SameSite=Lax";

        toast.info(t("userlogin.otpSent"));
        setLoading(false); // stop loading
        await router.push("/otp"); // wait for navigation
        return;
      }

      // ✅ Login success
      document.cookie = "otp_pending=; path=/; max-age=0";
      document.cookie = "otp_verified=true; path=/; max-age=3600";
      document.cookie = "mobile_blocked=; path=/; max-age=0";
      // ✅ SAVE UID FOR ENTIRE APP
      localStorage.setItem("uid", result.user.uid);

      toast.success(t("userlogin.googleLoginSuccess"));
      router.push("/");
    } catch (error: any) {
      const status = error.response?.data?.status;
      const message = error.response?.data?.message;

      if (status === "MOBILE_TIME_RESTRICTED") {
        document.cookie =
          "mobile_blocked=true; path=/; max-age=300; SameSite=Lax";
        toast.error(message);
        return; // ⛔ STOP execution
      }
      toast.error(message);
      toast.error(t("userlogin.googleLoginFailed"));
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);
      const response: any = await syncUser(result.user);

      // ✅ Persist login identity
      localStorage.setItem("uid", result.user.uid);
      localStorage.setItem("email", result.user.email || "");
      localStorage.setItem("name", "User"); // email login may not have displayName

      // ⏳ OTP required
      if (response.status === "OTP_REQUIRED") {
        document.cookie = "otp_pending=true; path=/; max-age=300; SameSite=Lax";

        toast.info(t("userlogin.otpSent"));

        setLoading(false); // stop loading
        await router.push("/otp"); // wait for navigation
        return;
      }

      // ✅ Login success
      document.cookie = "otp_pending=; path=/; max-age=0";
      document.cookie = "otp_verified=true; path=/; max-age=3600";
      document.cookie = "mobile_blocked=; path=/; max-age=0";
      // ✅ SAVE UID FOR ENTIRE APP
      localStorage.setItem("uid", result.user.uid);

      toast.success(t("userlogin.loginSuccess"));
      router.push("/");
    } catch (error: any) {
      const status = error.response?.data?.status;
      const message = error.response?.data?.message;

      if (status === "MOBILE_TIME_RESTRICTED") {
        document.cookie =
          "mobile_blocked=true; path=/; max-age=300; SameSite=Lax";
        toast.error(message);
        return; // ⛔ STOP execution
      }
      toast.error(message);
      toast.error(t("userlogin.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {t("userlogin.welcomeBack")}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {t("userlogin.loginToContinue")}
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              {t("userlogin.email")}
            </label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              {t("userlogin.password")}
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? t("userlogin.loggingIn") : t("userlogin.login")}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">
            {t("userlogin.or")}
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border py-2 rounded-lg flex justify-center gap-2"
        >
          {t("userlogin.continueWithGoogle")}
        </button>

        <p className="text-sm text-center mt-6 text-gray-600">
          {t("userlogin.dontHaveAccount")}{" "}
          <Link href="/usersignup" className="text-blue-600 font-medium">
            {t("userlogin.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
