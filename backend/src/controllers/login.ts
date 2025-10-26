import { GridClient } from "@sqds/grid";
import { GridSession } from "../gridsession.db";

export const checkAndInitAuth = async (email: string) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });

  try {
    console.log(`🔍 Checking if account exists for: ${email}`);

    const sessionSecrets = await gridClient.generateSessionSecrets();
    const response = await gridClient.initAuth({ email });

    if (response.success) {
      console.log("✅ Account exists! Sending login OTP...");

      // Save session for login
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await GridSession.findOneAndUpdate(
        { email },
        {
          sessionSecrets,
          expiresAt,
          otpSentAt: new Date(),
          status: "pending_login",
        },
        { upsert: true }
      );

      return { exists: true, response };
    }
  } catch (error) {
    console.log("⚠️  Account does not exist or error occurred");
    return { exists: false, error };
  }
};
