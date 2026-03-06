"use client";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useContext } from "react";
import { LanguageContext } from "@/utils/LanguageContext";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";

const plans = [
  {
    name: "FREE",
    price: 0,
    desc: "upgrade.plans.FREE",
    highlight: false,
    features: [
      "upgrade.features.oneApplication",
      "upgrade.features.basicAccess",
    ],
  },
  {
    name: "BRONZE",
    price: 100,
    desc: "upgrade.plans.BRONZE",
    highlight: false,
    features: [
      "upgrade.features.threeApplications",
      "upgrade.features.standardVisibility",
    ],
  },
  {
    name: "SILVER",
    price: 300,
    desc: "upgrade.plans.SILVER",
    highlight: true,
    features: [
      "upgrade.features.fiveApplications",
      "upgrade.features.priorityListing",
    ],
  },
  {
    name: "GOLD",
    price: 1000,
    desc: "upgrade.plans.GOLD",
    highlight: false,
    features: [
      "upgrade.features.unlimitedApplications",
      "upgrade.features.topVisibility",
    ],
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const endDate = userData?.subscription?.endDate;
  const isActive =
    userData?.subscription?.plan !== "FREE" &&
    endDate &&
    new Date() < new Date(endDate);

  const formattedExpiry =
    endDate &&
    new Date(endDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const daysRemaining =
    endDate &&
    Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

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

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const res = await fetch(
        `https://internshala-clone-xhqv.onrender.com/api/users/uid/${currentUser.uid}`,
      );

      const data = await res.json();
      console.log("Fetched user:", data);
      setUserData(data);
    };

    fetchUser();
  }, []);

  const currentPlan = userData?.subscription?.plan || "FREE";
  const used = userData?.subscription?.applicationsUsed || 0;
  const limit = userData?.subscription?.applicationLimit || 1;

  const isLimitReached = limit !== Infinity && used >= limit;

  const handleBuy = async (plan: string) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast.error(t("upgrade.userNotLoggedIn"));
      return;
    }

    const uid = currentUser.uid;

    // 🔒 Block upgrade if plan still active
    if (isActive) {
      const expiry = new Date(endDate);
      const formattedDate = expiry.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      toast.info(
        t("upgrade.planExpiryMessage").replace("{{date}}", formattedDate),
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://internshala-clone-xhqv.onrender.com/api/subscription/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, uid }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();

        switch (errorData.code) {
          case "PLAN_ACTIVE":
            toast.error(t("upgrade.planAlreadyActive"));
            break;

          case "UPGRADE_TIME_RESTRICTED":
            toast.error(t("upgrade.upgradeTimeRestricted"));
            break;

          case "INVALID_PLAN":
            toast.error(t("upgrade.invalidPlan"));
            break;

          case "CREATE_ORDER_FAILED":
            toast.error(t("upgrade.createOrderFailed"));
            break;

          default:
            toast.error(t("upgrade.somethingWentWrong"));
        }

        setLoading(false);
        return;
      }

      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Internship Portal",
        description: `${plan} Plan`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(
            "https://internshala-clone-xhqv.onrender.com/api/subscription/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                uid: currentUser.uid,
              }),
            },
          );

          const verifyData = await verifyRes.json();

          if (verifyData.status === "SUCCESS") {
            toast.success(t("upgrade.subscriptionActivated"));

            if (verifyData.invoiceSent) {
              toast.info(t("upgrade.invoiceSent"));
            }

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            toast.error(t("upgrade.verificationFailed ❌"));
          }
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      setLoading(false);
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error(t("upgrade.somethingWentWrong"));
      setLoading(false);
    }
  };
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-800">
            {t("upgrade.title")}
          </h1>
          <p className="text-gray-600 mt-4">{t("upgrade.subtitle")}</p>
        </div>

        {isLimitReached && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded text-center">
            {t("upgrade.limitReached")}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 shadow-md border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.highlight ? "border-blue-600 scale-105" : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full shadow-md">
                  {t("upgrade.mostPopular")}
                </span>
              )}

              <h2 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h2>

              <p className="text-3xl font-bold text-blue-600 mt-3">
                ₹{plan.price}
                <span className="text-sm text-gray-500 font-medium">
                  {" "}
                  {t("upgrade.perMonth")}
                </span>
              </p>

              <p className="text-gray-500 text-sm mt-2"> {t(plan.desc)}</p>

              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                {plan.features.map((feature, index) => (
                  <li key={index}>✔ {t(feature)}</li>
                ))}
              </ul>
              <br></br>
              {currentPlan === plan.name && isActive && (
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-2 rounded-lg mb-3 border border-green-400">
                  {t("upgrade.activeUntil")}
                  {formattedExpiry}
                  {daysRemaining && daysRemaining > 0 && (
                    <>
                      {" "}
                      • {daysRemaining} {t("upgrade.daysLeft")}
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => handleBuy(plan.name)}
                disabled={loading || currentPlan === plan.name || isActive}
                className={`w-full mt-6 py-2 rounded-lg font-semibold transition ${
                  currentPlan === plan.name
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {currentPlan === plan.name && isActive
                  ? t("upgrade.planActive")
                  : loading
                    ? t("upgrade.processing")
                    : t("upgrade.buyNow")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
