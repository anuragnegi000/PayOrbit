import { GridClient } from "@sqds/grid";
import { GridSession, GridUser } from "./gridsession.db";

export const gridAccountCreation = async (email: string,fullName:string) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });

  const existingSession = await GridSession.findOne({ email });

  if (existingSession?.status === "verified") {
    console.log("⚠️  Account already verified locally. Use login flow.");
    return;
  }

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
    const savedSession = await GridSession.findOneAndUpdate(
      { email },
      {
        sessionSecrets,
        expiresAt,
        otpSentAt: new Date(),
        status: "pending_verification",
        // Keep existing signers if they exist
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

// Check if account exists and try to login instead
export const checkAndInitAuth = async (email: string) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });

  try {
    // Try to initialize auth for existing account
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

export const verifyOtpExisting = async (otpCode: string, email: string) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });
  const session = await GridSession.findOne({ email });
  if (!session) {
    throw new Error("No session found for this email");
  }
  const authenticatedAccount = await gridClient.completeAuth({
    user: {
      email: email,
      signers: session.signers || [],
    },
    otpCode: otpCode,
    sessionSecrets: session.sessionSecrets,
  });

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

    const saveUser = await GridUser.create({
      email,
      publicKey: authenticatedAccount.data.address,
      gridId: authenticatedAccount.data.grid_user_id,
    });
    console.log(saveUser);
    console.log("✅ Account verified successfully!");
    console.log(`   Signers saved: ${authenticatedSigners.length}`);
    return authenticatedAccount;
  }
  console.log(
    "\n📥 completeAuth response:",
    JSON.stringify(authenticatedAccount, null, 2)
  );
};

export const verifyOtp = async (otpCode: string, email: string) => {
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
    // Build user payload - DO NOT include signers for first-time auth
    const userPayload: any = {
      email: email,
    };

    const authenticatedAccount = await gridClient.completeAuthAndCreateAccount({
      user: userPayload,
      otpCode: otpCode,
      sessionSecrets: session.sessionSecrets,
    });

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

      const saveUser = await GridUser.create({
        email,
        publicKey: authenticatedAccount.data.address,
        gridId: authenticatedAccount.data.grid_user_id,
      });
      console.log(saveUser);
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

export const createVirtualAccount = async (
  email: string,
) => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });
  const user = await GridUser.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  gridClient.requestKycLink
  const gridUserId = user.gridId;
  const address = user.publicKey;
  const virtualAccount = await gridClient.requestVirtualAccount(address, {
    grid_user_id: gridUserId,
    currency: "usd",
  });
  console.log(virtualAccount);
  return virtualAccount
};


export const completeKYC=async(email:string)=>{
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz",
  });
  const user = await GridUser.findOne({ email});
  if(!user){
    throw new Error("User not found");
  }
  const kyc = await gridClient.requestKycLink(
    user.publicKey, 
    {
      grid_user_id: user.gridId,
      type: 'individual',
      email: user.email,
      full_name: user.fullName,
      endorsements: [],
      redirect_uri: 'https://myapp.com/kyc-complete'
    }
  );
  const virtualAccount = await gridClient.requestVirtualAccount(user.publicKey, {
    grid_user_id: user.gridId,
    currency: "usd",
  });
  const virtualResponse=await gridClient.getVirtualAccounts(user.publicKey);
  console.log(JSON.stringify(virtualResponse.data, null, 2));
  console.log(virtualAccount);
  console.log(kyc);
  return kyc;
}