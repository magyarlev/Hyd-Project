import cors from "cors";
import express from "express";
import path from "path";
import dotenv from "dotenv";

import fs from "fs";

const loadEnv = () => {
  // Render Secret Files are mounted under /etc/secrets/<filename>
  // Prefer /etc/secrets/.env if present, otherwise load all files in /etc/secrets.
  const secretsDir = "/etc/secrets";
  const preferredSecretEnv = "/etc/secrets/.env";

  if (fs.existsSync(preferredSecretEnv)) {
    dotenv.config({ path: preferredSecretEnv });
  } else if (fs.existsSync(secretsDir)) {
    const secretFiles = fs
      .readdirSync(secretsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(secretsDir, entry.name));

    for (const secretFile of secretFiles) {
      dotenv.config({ path: secretFile });
    }
  }

  // Local dev fallback (repo root or server folder, depending on how it's started)
  dotenv.config({ path: ".env" });
  dotenv.config({ path: "../.env" });
};

loadEnv();

// IMPORTANT: load env vars before requiring modules that read process.env at import time.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require("./api/api").default;

dotenv.config({ path: "/etc/secrets/.env" });
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API routes
app.use("/api", api);

// Serve Angular dist folder
const distPath = path.join(__dirname, "../hyd/dist/hyd/browser");
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  const env = process.env.NODE_ENV || "development";
  const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";
  console.log(`Server running in ${env} mode`);
  console.log(`Server listening on port ${port}`);
  console.log(`Frontend URL: ${clientUrl}`);
});
