import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("server is live!");
});

app.listen(PORT, () => {
  console.log("Server is running on 8000");
});
