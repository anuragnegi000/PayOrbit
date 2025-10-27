import { GridClient } from "@sqds/grid";
import { GridSession, GridUser } from "../gridsession.db";
import {Request, Response} from "express";

export const gridAccountCreation = async (req:Request,res:Response) => {
  const { email, fullName } = req.body;
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


export const verifyOtp = async (req:Request,res:Response) => {
  const { otpCode, email } = req.body;
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });

  // Fetch session from MongoDB
  const session = await GridSession.findOne({ email });
  if (!session) {
    throw new Error("No session found for this email");
  }

  // Check if OTP has expired
  if (session.expiresAt && new Date() > session.expiresAt) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  try {
    let authenticatedAccount;

    // Debug logging
    console.log(`🔍 Session status: ${session.status}`);
    console.log(`🔍 Signers count: ${session.signers?.length || 0}`);
    console.log(`🔍 Signers array:`, JSON.stringify(session.signers, null, 2));

    // Check if this is a login (existing account) or new account creation
    if (session.status === "pending_login") {
      // This is an existing account login - use completeAuth
      // Even if signers array is empty, we still use completeAuth for existing accounts
      console.log(
        `🔓 Logging in existing account (${
          session.signers?.length || 0
        } signers)...`
      );

      const userPayload: any = {
        email: email,
        signers: session.signers || [], // Include signers if available (can be empty for existing accounts)
      };

      authenticatedAccount = await gridClient.completeAuth({
        user: userPayload,
        otpCode: otpCode,
        sessionSecrets: session.sessionSecrets,
      });
    } else {
      // This is a new account - use completeAuthAndCreateAccount without signers
      console.log(
        "🆕 Creating new account (status is pending_verification)..."
      );

      const userPayload: any = {
        email: email,
        // DO NOT include signers for first-time auth
      };

      authenticatedAccount = await gridClient.completeAuthAndCreateAccount({
        user: userPayload,
        otpCode: otpCode,
        sessionSecrets: session.sessionSecrets,
      });
    }

    console.log(
      "\n📥 completeAuth response:",
      JSON.stringify(authenticatedAccount, null, 2)
    );

    // Update session with signers and verified status on success
    if (authenticatedAccount.success && authenticatedAccount.data) {
      //@ts-ignore
      const authenticatedSigners = authenticatedAccount.data.signers || [];
      await GridSession.findOneAndUpdate(
        { email },
        {
          status: "verified",
          signers: authenticatedSigners,
          verifiedAt: new Date(),
        }
      );

      // Check if user already exists to avoid duplicates
      const existingUser = await GridUser.findOne({ email });
      if (!existingUser) {
        const saveUser = await GridUser.create({
          email,
          fullName: session.fullName || email, // Use fullName from session or fallback to email
          publicKey: authenticatedAccount.data.address,
          gridId: authenticatedAccount.data.grid_user_id,
        });
        console.log("💾 User saved:", saveUser);
      } else {
        console.log("ℹ️  User already exists in database");
      }

      console.log("✅ Account verified successfully!");
      console.log(`   Signers saved: ${authenticatedSigners.length}`);
      return authenticatedAccount;
    } else {
      console.error("❌ Authentication failed:", authenticatedAccount.error);
      throw new Error(authenticatedAccount.error || "Authentication failed");
    }
  } catch (error) {
    console.error("❌ Error during OTP verification:", error);
    throw error;
  }
};