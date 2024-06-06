import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import router from "./routes/route.js";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";


const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");
dotenv.config({
  path: "./.env",
});


/* HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

app.use("/api", router);

connectDB().then(() => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`server is running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
});
