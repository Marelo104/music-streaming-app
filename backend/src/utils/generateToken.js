import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config() 

export const generateTokenAndSendCookie = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie("authToken", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'development',
  });

return token;
}