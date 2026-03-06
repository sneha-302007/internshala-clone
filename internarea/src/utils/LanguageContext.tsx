import { createContext, useState, useEffect, ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  translations: Record<string, string>;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  changeLanguage: () => {},
  translations: {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const user = useSelector(selectuser);
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    loadLanguage(savedLang);
  }, []);

  const loadLanguage = async (lang: string) => {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      const data = await res.json();
      setTranslations(data);
      setLanguage(lang);
      localStorage.setItem("language", lang);
    } catch (error) {
      console.error("Language load failed", error);
    }
  };

  const changeLanguage = async (lang: string) => {
    // 🚫 If not logged in
    if (!user?.uid) {
      toast.info("Please login to change language");
      router.push("/userlogin");
      return;
    }

    // 🇫🇷 French logic
    if (lang === "fr") {
      if (!user.isFrenchVerified) {
        try {
          await axios.post(
            "https://internshala-clone-xhqv.onrender.com/api/users/send-otp",
            {
              uid: user.uid,
              purpose: "french",
            }
          );

          toast.info("OTP sent to your email");
          router.push("/otp?type=french");
          return;
        } catch (error) {
          toast.error("Failed to send OTP");
          return;
        }
      }
    }

    // Normal language change
    await loadLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, translations }}
    >
      {children}
    </LanguageContext.Provider>
  );
};