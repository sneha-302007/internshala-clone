import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";
import { LanguageContext } from "@/utils/LanguageContext";

type LoginHistory = {
  ip: string;
  browser: string;
  os: string;
  deviceType: string;
  loggedInAt: string;
  loginTime: string;
  timestamps: string;
};

const LoginHistoryPage = () => {
  const user = useSelector(selectuser);
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const { language, changeLanguage, translations } =
    useContext(LanguageContext);

  const t = (key: string): string => {
    return (
      key.split(".").reduce((obj: any, i: string) => obj?.[i], translations) ||
      key
    );
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchLoginHistory = async () => {
      try {
        const res:any = await axios.get(
          `https://internshala-clone-xhqv.onrender.com/api/users/login-history/${user.uid}`
        );
        setHistory(res.data);
      } catch (error) {
        console.error(t("loginHistoryPage.fetchError"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, [user, language]); // 🔥 important so it re-renders when language changes

  if (loading)
    return (
      <p style={{ padding: 20 }}>
        {t("loginHistoryPage.loading")}
      </p>
    );

  return (
    <div style={{ padding: "25px" }}>
      <h2 style={{ marginBottom: "15px" }}>
        {t("loginHistoryPage.title")}
      </h2>

      {history.length === 0 ? (
        <p>{t("loginHistoryPage.noHistory")}</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>{t("loginHistoryPage.browser")}</th>
              <th style={thStyle}>{t("loginHistoryPage.os")}</th>
              <th style={thStyle}>{t("loginHistoryPage.device")}</th>
              <th style={thStyle}>{t("loginHistoryPage.ipAddress")}</th>
              <th style={thStyle}>{t("loginHistoryPage.loginTime")}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.browser}</td>
                <td style={tdStyle}>{item.os}</td>
                <td style={tdStyle}>{item.deviceType}</td>
                <td style={tdStyle}>{item.ip}</td>
                <td style={tdStyle}>
                  {new Date(item.loginTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f4f4f4",
  textAlign: "left" as const,
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
};

export default LoginHistoryPage;