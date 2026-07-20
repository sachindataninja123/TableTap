import app from "./app.js";
import connectToDB from "./db/db.js";

const PORT = process.env.PORT || 5000;
connectToDB();

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
