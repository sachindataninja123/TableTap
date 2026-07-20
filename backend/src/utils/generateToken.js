import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );

  return token;
};
