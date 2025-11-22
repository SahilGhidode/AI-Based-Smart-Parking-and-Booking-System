import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserByGoogleId,
  createGoogleUser
} from "../models/userModel.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// STEP 1: redirect user to google login page
export const googleAuthRedirect = (req, res) => {
  console.log("🔥 googleAuthRedirect HIT");

  const redirectUrl = 
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" + process.env.GOOGLE_CLIENT_ID +
    "&redirect_uri=" + encodeURIComponent(process.env.GOOGLE_REDIRECT_URL) +
    "&response_type=code" +
    "&scope=" + encodeURIComponent("openid email profile") +
    "&access_type=offline" +
    "&prompt=select_account";

  console.log("🌐 GOOGLE REDIRECT URL:", redirectUrl);

  res.redirect(redirectUrl);
};

// STEP 2: google redirects back after login
export const googleAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    });

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // find user by google id or email
    let user = await findUserByGoogleId(googleId);
    if (!user) user = await findUserByEmail(email);

    // create user if doesn't exist (Google Signup)
    if (!user) {
      user = await createGoogleUser(name, email, googleId, picture);
    }

    // create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🌟 redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/google-success?token=${token}`);

  } catch (error) {
    console.error("Google Callback Error:", error);
    res.status(500).send("Google Authentication Failed");
  }
};
