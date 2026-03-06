import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { auth } from "@/firebase/firebase";
import { login, logout } from "../feature/Userslice";
import { LanguageProvider } from "@/utils/LanguageContext";

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (authuser) => {
        if (authuser) {
          // 🔁 STORE IN REDUX ONLY (NO SYNC CALL)
          dispatch(
            login({
              uid: authuser.uid,
              photo: authuser.photoURL,
              name: authuser.displayName,
              email: authuser.email,
              phoneNumber: authuser.phoneNumber,
            })
          );
        } else {
          dispatch(logout());
        }
      });

      return () => unsubscribe();
    }, [dispatch]);

    return null;
  }

  return (
    <Provider store={store}>
          <LanguageProvider>
       {/* Razorpay Checkout Script */}
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="beforeInteractive"
    />
      <AuthListener />
      <div className="bg-white">
        <ToastContainer />
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
      </LanguageProvider>
    </Provider>
  );
}
