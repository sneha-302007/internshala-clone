import React from "react";
import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useContext } from "react";
import { LanguageContext } from "@/utils/LanguageContext";

const Navbar = () => {
  const user = useSelector(selectuser);
  const { language, changeLanguage, translations } =
  useContext(LanguageContext);

  const t = (key: string): string => {
    return (
      key.split(".").reduce((obj: any, i: string) => {
        return obj?.[i];
      }, translations) || key
    ); 
  };
  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "hi", label: "Hindi" },
    { code: "pt", label: "Portuguese" },
    { code: "zh", label: "Chinese" },
    { code: "fr", label: "French" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(t("navbar.Logged out successfully"));
    } catch (error) {
      toast.error(t("navbar.Logout failed"));
    }
  };
  const router = useRouter();

  const handleCommunityClick = () => {
    if (!user) {
      toast.info(t("navbar.Please login to access community"));
      router.push("/userlogin");
    } else {
      router.push("/community/feed");
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/">
            <img src="/logo.png" className="h-14 cursor-pointer" />
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center space-x-8 font-medium">
            <Link href="/internship" className="hover:text-blue-600">
              {t("navbar.Internships")}
            </Link>

            <Link href="/job" className="hover:text-blue-600">
              {t("navbar.Jobs")}
            </Link>

            {/* Community always redirects to Feed */}
            <button
              onClick={handleCommunityClick}
              className="hover:text-blue-600 font-medium"
            >
              {t("navbar.Community")}
            </button>

            <Link
              href={user ? "/resume" : "/userlogin"}
              className="hover:text-blue-600"
            >
            {t("navbar.Resume Generator")}
            </Link>

            {/* Search Bar */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={16} />
              <input
                className="ml-2 bg-transparent focus:outline-none text-sm"
                placeholder={t("Search...")}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
             {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
            {!user ? (
              <>
                <Link href="/adminlogin" className="text-gray-600">
                 {t ("navbar.Admin")}
                </Link>

                <Link href="/userlogin">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  { t("navbar.Login")}
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/loginHistory" className="hover:text-blue-600">
                { t ("navbar.Login History")}
                </Link>

                {user?.plan !== "GOLD" && (
                  <Link href="/subscription" className="hover:text-blue-600">
                   {t ("navbar.Upgrade")}
                  </Link>
                )}

                {/* Profile */}
                <Link href="/profile">
                  <img
                    src={user.photo || "/avatar.png"}
                    className="w-9 h-9 rounded-full cursor-pointer border"
                  />
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} />
              { t("navbar.Logout")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
