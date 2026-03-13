InternArea 🚀
InternArea is a full-stack internship platform inspired by an Internshala-style system. It allows students to browse and apply for internships with secure authentication, OTP verification, and a subscription-based application system.

This project goes beyond a basic clone by implementing several advanced features such as payment-based plans, resume generation, login tracking, multilingual support, and a controlled social posting system.

🌐 Live Demo
https://internshala-clone-eta.vercel.app

🚀 How to Run the Project
-	Clone the repository
-	git clone https://github.com/yourusername/internarea.git
-	Install dependencies → npm install
-	Start backend → npm run server
-	Start frontend → npm run dev

✨ Features

🔐 Authentication & Security
-	Secure OTP-based login verification via email
-	Forgot password system
-	Password reset allowed only once per day
-	Random password generator using uppercase and lowercase letters
-	Device and IP-based login tracking
-	Login history stored in the database

💳 Subscription System
Integrated payment gateway logic similar to Razorpay / Stripe.
-	Free Plan – ₹0 – Apply to 1 internship
-	Bronze Plan – ₹100/month – Apply to 3 internships
-	Silver Plan – ₹300/month – Apply to 5 internships
-	Gold Plan – ₹1000/month – Unlimited internship applications
-   ⏰After successful payment the system emails the invoice and plan details to the user.
-   📧Payment allowed only between 10 AM – 11 AM IST.


📄 Resume Builder
-	Users can enter name, qualification, experience, personal details, and profile photo
-	Resume automatically attaches to student profile
-	Used when applying for internships
-	Premium feature costing ₹50 per resume
-	Email OTP verification required before payment

🌍 Multi‑Language Support
-	English
-	Hindi
-	Spanish
-	Portuguese
-	Chinese
-	French
-   📧Email verification required when switching to French language.

🧑‍🤝‍🧑 Social Public Space
-	Upload pictures and videos
-	Like, comment, and share posts
📊 Posting Rules
-	0 friends → 1 post per day
-	2 friends → 2 posts per day
-	10+ friends → unlimited posts per day

📊 Login Tracking System
-	Browser type
-	Operating system
-   Device type (desktop / mobile)
-	IP address
-	Login time
-   📱Mobile login allowed only between 10 AM – 1 PM IST.


🛠️ Tech Stack
-   Frontend: React, Next.js, HTML, CSS, JavaScript
-	Backend: Node.js, Express.js
-	Database: MongoDB
-	Authentication & Email: Firebase, Emailjs
-	Payments: Razorpay
-	Deployment: Render, Vercel

👩‍💻 Author  
   Sneha kolekar
