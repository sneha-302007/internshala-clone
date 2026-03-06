import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";
import { toast } from "react-toastify";
import { useContext } from "react";
import { LanguageContext } from "@/utils/LanguageContext";
import { login } from "@/feature/Userslice";
import { useDispatch } from "react-redux";

export default function OTPPage() {
  const router = useRouter();
  const user = useSelector(selectuser);
  const dispatch = useDispatch();

  const { language, changeLanguage, translations } =
    useContext(LanguageContext);

  const t = (key: string): string => {
    return (
      key.split(".").reduce((obj: any, i: string) => {
        return obj?.[i];
      }, translations) || key
    );
  };

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user?.uid) {
      router.replace("/userlogin");
    }
  }, [user, router]);

  if (!user?.uid) return null;

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error(t("otp.enterValidOtp"));
      return;
    }

    try {
      setLoading(true);

      await axios.post("https://internshala-clone-xhqv.onrender.com/api/users/verify-otp", {
        uid: user.uid,
        otp,
        type: router.query.type || "login",
      });

      // refresh user
      const updatedUser = await axios.get(
        `https://internshala-clone-xhqv.onrender.com/api/users/uid/${user.uid}`,
      );

      dispatch(login(updatedUser.data));

      // set french in storage
      localStorage.setItem("language", "fr");

      // unlock cookies
      document.cookie = "otp_pending=; Max-Age=0; path=/";
      document.cookie = "app_authenticated=true; path=/";

      toast.success(t("otp.otpVerified"));

      // redirect
      router.replace("/");
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("otp.invalidOtp"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{t("otp.title")}</h2>
        <p>{t("otp.subtitle")}</p>

        <input
          type="text"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value)}
          placeholder={t("otp.placeholder")}
          style={styles.input}
        />

        <button onClick={verifyOTP} disabled={loading} style={styles.button}>
          {loading ? t("otp.verifying") : t("otp.verifyButton")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    marginTop: "15px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
