import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase on server
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);

const app = express();
app.use(express.json());

const PORT = 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Encryption helper
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "default-secret-change-me";
function encrypt(text: string) {
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32), Buffer.alloc(16, 0));
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

// OAuth Configurations
const PLATFORMS: Record<string, any> = {
  tiktok: {
    authUrl: "https://www.tiktok.com/auth/authorize/",
    tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    scope: "video.upload,video.publish,user.info.basic",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v12.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v12.0/oauth/access_token",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    scope: "pages_show_list,pages_read_engagement,pages_manage_posts,publish_video",
  },
};

// API: Get Auth URL
app.get("/api/auth/url/:platform", (req, res) => {
  const { platform } = req.params;
  const config = PLATFORMS[platform];
  if (!config) return res.status(400).json({ error: "Invalid platform" });

  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  const redirectUri = `${APP_URL}/auth/callback/${platform}`;
  const params = new URLSearchParams({
    client_id: config.clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
    state: userId, // Pass userId in state to associate account on callback
  });

  res.json({ url: `${config.authUrl}?${params.toString()}` });
});

// Callback: Handle OAuth redirect
app.get("/auth/callback/:platform", async (req, res) => {
  const { platform } = req.params;
  const { code, state: userId } = req.query;
  const config = PLATFORMS[platform];

  if (!code || !userId) {
    return res.status(400).send("Missing code or state");
  }

  try {
    // In a real app, you'd exchange code for token here
    // const tokenResponse = await axios.post(config.tokenUrl, ...);
    // For now, we simulate success or provide a path for the user to see what's needed
    
    console.log(`OAuth Callback received for ${platform} and user ${userId}`);

    // Mock token for demo if no real keys
    const mockToken = `mock_${platform}_token_${Math.random().toString(36).substring(7)}`;
    
    // Store in Firestore (In real app, encrypt this!)
    await setDoc(doc(db, "users", userId as string, "connections", platform), {
      platform,
      userId,
      accessToken: encrypt(mockToken),
      accountName: `${platform.toUpperCase()} User`,
      connectedAt: new Date().toISOString(),
      isMock: !config.clientId // Flag if it's a simulated connection
    });

    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platform}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <div style="padding: 2rem; background: #111; border-radius: 1rem; text-align: center;">
            <h1 style="color: #4ade80;">Success!</h1>
            <p>${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully.</p>
            <p>You can close this window now.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth Exchange Error:", error);
    res.status(500).send("Authentication failed");
  }
});

// API: Broadcast Post
app.post("/api/broadcast", async (req, res) => {
  const { userId, content, mediaUrls, platforms } = req.body;

  if (!userId || !content || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const results: Record<string, any> = {};
  
  for (const platform of platforms) {
    try {
      const connDoc = await getDoc(doc(db, "users", userId, "connections", platform));
      if (!connDoc.exists()) {
        results[platform] = { status: "error", message: "Platform not connected" };
        continue;
      }

      const connection = connDoc.data();
      // In a real app: use connection.accessToken to call Social Platform API
      // e.g. axios.post('https://graph.facebook.com/me/feed', { message: content }, { headers: { Authorization: `Bearer ${connection.accessToken}` } });

      // For demo, we simulate the broadcast
      console.log(`Broadcasting to ${platform} for user ${userId}: ${content}`);
      results[platform] = { status: "success", message: "Posted successfully (Simulated)" };
    } catch (error) {
      results[platform] = { status: "error", message: "Broadcast failed" };
    }
  }

  // Save post history
  await setDoc(doc(db, "posts", `${Date.now()}`), {
    userId,
    content,
    mediaUrls,
    platforms,
    status: "completed",
    results,
    createdAt: new Date().toISOString(),
  });

  res.json({ results });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
