import app from "./app.js";
import connectToDB from "./db/db.js";
import { startExpireBookingsJob } from "./jobs/expireBookings.job.js";

const PORT = process.env.PORT || 5000;
connectToDB();

startExpireBookingsJob();

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
