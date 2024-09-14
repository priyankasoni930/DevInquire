const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/answers", require("./routes/answerRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/tags", require("./routes/tagRoutes"));
app.use("/api/badges", require("./routes/badgeRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
