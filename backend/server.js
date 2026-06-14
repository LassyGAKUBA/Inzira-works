import app from "./src/app.js";
import { env } from "./src/config/env.js";

app.listen(env.port, () => {
  console.log(`🚀 Inzira Works API running on port ${env.port} (${env.nodeEnv})`);
  console.log(`   Health check: http://localhost:${env.port}/api/health`);
});
