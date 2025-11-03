import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your Threads App details
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://meta-qe59.onrender.com/auth/callback";

// Step 1: Start login
app.get("/", (req, res) => {
  const authUrl = `https://www.threads.net/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=threads_basic,threads_content_publish&response_type=code`;

  res.send(`<a href="${authUrl}">Login with Threads</a>`);
});

// Step 2: Handle callback and exchange code for short-lived token
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided.");

  try {
    const tokenRes = await fetch(
      `https://graph.threads.net/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&code=${code}`
    );

    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      // Step 3: Exchange for long-lived token
      const longTokenRes = await fetch(
        `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${tokenData.access_token}`
      );
      const longTokenData = await longTokenRes.json();

      res.send(`
        <h2>✅ Token Exchange Successful!</h2>
        <p><strong>Short-lived Token:</strong> ${tokenData.access_token}</p>
        <p><strong>Long-lived Token:</strong> ${longTokenData.access_token || "Error fetching long token"}</p>
      `);
    } else {
      res.send(`<p>Error fetching token:</p><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
    }
  } catch (err) {
    console.error(err);
    res.send("Error during token exchange.");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
