import { GridClient } from "@sqds/grid";
import { GridSession } from "../gridsession.db";

export const gridAccountCreation = async (email: string,fullName:string) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });

  const existingSession = await GridSession.findOne({ email });

  // if (existingSession?.status === "verified") {
  //   console.log("⚠️  Account already verified locally. Use login flow.");
  //   return;
  // }

  // if (
  //   existingSession?.status === "pending_verification" &&
  //   existingSession.otpSentAt
  // ) {
  //   const timeSinceOtp =
  //     Date.now() - new Date(existingSession.otpSentAt).getTime();
  //   if (timeSinceOtp < 120000) {
  //     // Less than 2 minutes
  //     const seconds = Math.floor(timeSinceOtp / 1000);
  //     console.log(
  //       `⚠️  OTP was sent ${seconds} seconds ago. Use the existing OTP!`
  //     );
  //     console.log(
  //       `   Last OTP sent at: ${existingSession.otpSentAt.toISOString()}`
  //     );
  //     console.log(`   Expires at: ${existingSession.expiresAt?.toISOString()}`);
  //     console.log("\n💡 To verify, call:");
  //     console.log(`   await verifyManualOtp("${email}", "CODE_FROM_EMAIL")`);
  //     throw new Error(
  //       "OTP already sent recently. Check your email and use verifyManualOtp()."
  //     );
  //   }
  // }

  // 1️⃣ Generate session secrets
  const sessionSecrets = await gridClient.generateSessionSecrets();
  console.log("🔑 Session secrets generated");

  try {
    console.log("📧 Attempting createAccount...");
    const response = await gridClient.createAccount({ email });

    console.log("CreateAccount response:", JSON.stringify(response, null, 2));

    if (!response.success) {
      console.log("⚠️  createAccount failed, trying initAuth instead...");
      throw new Error("Switch to initAuth");
    }

    if (response.data?.type !== "email") {
      throw new Error("Unexpected account response type");
    }

    console.log(`✅ New account created for: ${email}`);

    // Save session
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await GridSession.deleteOne({ email });

    const savedSession = await GridSession.create({
      email,
      fullName,
      sessionSecrets,
      expiresAt,
      otpSentAt: new Date(),
      status: "pending_verification",
      signers: [],
    });

    return {
      email,
      fullName,
      expiresAt,
      isNewAccount: true,
      sessionId: savedSession._id,
    };
  } catch (error: any) {
    // If createAccount fails, use initAuth (works for existing accounts)
    console.log("\n🔄 Switching to initAuth flow for existing account...");

    const initResponse = await gridClient.initAuth({ email });
    console.log("InitAuth response:", JSON.stringify(initResponse, null, 2));

    if (!initResponse.success) {
      throw new Error(
        initResponse.error || "Failed to initialize authentication"
      );
    }

    // Save session for existing account
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Get existing session to preserve signers
    const existingSession = await GridSession.findOne({ email });
    const existingSigners = existingSession?.signers || [];
    
    console.log(`📋 Found ${existingSigners.length} signers from previous session`);
    
    const savedSession = await GridSession.findOneAndUpdate(
      { email },
      {
        sessionSecrets,
        signers: existingSigners, // Preserve existing signers
        expiresAt,
        otpSentAt: new Date(),
        status: "pending_login", // IMPORTANT: Set to pending_login for existing accounts
      },
      { upsert: true, new: true }
    );


    return {
      email,
      expiresAt,
      isNewAccount: false,
      sessionId: savedSession._id,
    };
  }
};