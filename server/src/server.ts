import "dotenv/config";
import app from "./app.js";
import connectToDB from "./db/db.js";

const PORT = process.env.PORT || 8000;
connectToDB();

app.listen(PORT, () => {
  console.log("Server is running on 8000");
});
