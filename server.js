import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const response = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "4165825233682600",
        client_secret: "e726319138b11385a6d08c50dc0d64c8",
        redirect_uri: "https://yourdomain.com/auth/callback",
        code,
      }),
    });

    const data = await response.json();
    console.log("Access token response:", data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exchanging code for access token");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
