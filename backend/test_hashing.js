import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config({ path: "./.env" });

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const email = "test" + Date.now() + "@test.com";
  const password = "password123";

  console.log("\nCreating user via User.create...");
  const user = await User.create({
    name: "Test user",
    email,
    password,
  });

  // Read back to be 100% sure what's in DB
  const fetchedUser = await User.findOne({ email }).select("+password");
  console.log("Hashed password after create:", fetchedUser.password);

  const isMatchFirst = await fetchedUser.matchPassword(password);
  console.log(" Match on first try:", isMatchFirst);

  console.log("\nUpdating refreshToken and saving...");
  fetchedUser.refreshToken = "dummy-token";
  await fetchedUser.save();

  const fetchedAgain = await User.findOne({ email }).select("+password");
  console.log("Hashed password after update:", fetchedAgain.password);

  const isMatchSecond = await fetchedAgain.matchPassword(password);
  console.log(" Match after update save:", isMatchSecond);

  if (isMatchFirst && isMatchSecond) {
    console.log("\n[SUCCESS]: Hashing logic holds across saves.");
  } else {
    console.log("\n[FAILURE]: Double-hashing detected or logic broken.");
  }

  await mongoose.disconnect();
};

test().catch((err) => {
  console.error(err);
  process.exit(1);
});
