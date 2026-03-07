const bodyparser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("./db");
const router = require("./Routes/index");
const paymentRoutes = require("./Routes/payment"); // ✅ ADD THIS
const subscriptionPaymentRoutes = require("./Routes/subscriptionPayment"); // ✅ ADD
const port = 5000;

app.use(cors());
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello this is internshala backend");
});

// 🔥 REGISTER ROUTES HERE
app.use("/api", router);
app.use("/api/payment", paymentRoutes); // ✅ CORRECT PLACE
app.use("/api/subscription", subscriptionPaymentRoutes); // ✅ ADD


connect();

// Optional headers middleware (can be removed since you use cors)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
