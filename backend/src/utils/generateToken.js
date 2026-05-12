import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config() 

export const generateTokenAndSendCookie = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === "production";
  const clientUrl = process.env.CLIENT_URL;
  const serverUrl = process.env.SERVER_URL;
  const isCrossOriginDeployment =
    isProduction &&
    clientUrl &&
    serverUrl &&
    new URL(clientUrl).origin !== new URL(serverUrl).origin;

  res.cookie("authToken", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: isCrossOriginDeployment ? 'none' : 'lax',
    secure: isProduction,
  });

return token;
}
