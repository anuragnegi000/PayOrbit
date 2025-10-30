"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVirtualAccounts = exports.completeKYC = exports.createVirtualAccount = exports.verifyOtp = exports.verifyOtpExisting = exports.checkAndInitAuth = exports.gridAccountCreation = void 0;
const grid_1 = require("@sqds/grid");
const gridsession_db_1 = require("./gridsession.db");
const gridAccountCreation = async (email, fullName) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    const existingSession = await gridsession_db_1.GridSession.findOne({ email });
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
        await gridsession_db_1.GridSession.deleteOne({ email });
        const savedSession = await gridsession_db_1.GridSession.create({
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
    }
    catch (error) {
        // If createAccount fails, use initAuth (works for existing accounts)
        console.log("\n🔄 Switching to initAuth flow for existing account...");
        const initResponse = await gridClient.initAuth({ email });
        console.log("InitAuth response:", JSON.stringify(initResponse, null, 2));
        if (!initResponse.success) {
            throw new Error(initResponse.error || "Failed to initialize authentication");
        }
        // Save session for existing account
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Get existing session to preserve signers
        const existingSession = await gridsession_db_1.GridSession.findOne({ email });
        const existingSigners = existingSession?.signers || [];
        console.log(`📋 Found ${existingSigners.length} signers from previous session`);
        const savedSession = await gridsession_db_1.GridSession.findOneAndUpdate({ email }, {
            sessionSecrets,
            signers: existingSigners, // Preserve existing signers
            expiresAt,
            otpSentAt: new Date(),
            status: "pending_login", // IMPORTANT: Set to pending_login for existing accounts
        }, { upsert: true, new: true });
        return {
            email,
            expiresAt,
            isNewAccount: false,
            sessionId: savedSession._id,
        };
    }
};
exports.gridAccountCreation = gridAccountCreation;
// Check if account exists and try to login instead
const checkAndInitAuth = async (email) => {
    const gridClient = new grid_1.GridClient({
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
            const data = await gridsession_db_1.GridSession.findOneAndUpdate({ email }, {
                sessionSecrets,
                expiresAt,
                otpSentAt: new Date(),
                status: "pending_login",
            }, { upsert: true });
            return { exists: true, response, data };
        }
    }
    catch (error) {
        console.log("⚠️  Account does not exist or error occurred");
        return { exists: false, error };
    }
};
exports.checkAndInitAuth = checkAndInitAuth;
const verifyOtpExisting = async (otpCode, email) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    const session = await gridsession_db_1.GridSession.findOne({ email });
    if (!session) {
        throw new Error("No session found for this email");
    }
    console.log(`🔍 Session status: ${session}`);
    const authenticatedAccount = await gridClient.completeAuth({
        user: {
            email: email,
            signers: session.signers || [],
        },
        otpCode: otpCode,
        sessionSecrets: session.sessionSecrets,
    });
    console.log("\n📥 completeAuth response:", JSON.stringify(authenticatedAccount, null, 2));
    if (authenticatedAccount.success && authenticatedAccount.data) {
        //@ts-ignore
        const authenticatedSigners = authenticatedAccount.data.signers || [];
        await gridsession_db_1.GridSession.findOneAndUpdate({ email }, {
            fullName: session.fullName || email,
            status: "verified",
            signers: authenticatedSigners,
            verifiedAt: new Date(),
        });
        const isUserExists = await gridsession_db_1.GridUser.findOne({ email });
        if (!isUserExists) {
            const saveUser = await gridsession_db_1.GridUser.create({
                email,
                fullName: session.fullName || email,
                publicKey: authenticatedAccount.data.address,
                gridId: authenticatedAccount.data.grid_user_id,
            });
            console.log("💾 User saved:", saveUser);
        }
        console.log(isUserExists);
        console.log("✅ Account verified successfully!");
        console.log(`   Signers saved: ${authenticatedSigners.length}`);
        return authenticatedAccount;
    }
    console.log("\n📥 completeAuth response:", JSON.stringify(authenticatedAccount, null, 2));
};
exports.verifyOtpExisting = verifyOtpExisting;
const verifyOtp = async (otpCode, email) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    // Fetch session from MongoDB
    const session = await gridsession_db_1.GridSession.findOne({ email });
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
            console.log(`🔓 Logging in existing account (${session.signers?.length || 0} signers)...`);
            const userPayload = {
                email: email,
                signers: session.signers || [], // Include signers if available (can be empty for existing accounts)
            };
            authenticatedAccount = await gridClient.completeAuth({
                user: userPayload,
                otpCode: otpCode,
                sessionSecrets: session.sessionSecrets,
            });
        }
        else {
            // This is a new account - use completeAuthAndCreateAccount without signers
            console.log("🆕 Creating new account (status is pending_verification)...");
            const userPayload = {
                email: email,
                // DO NOT include signers for first-time auth
            };
            authenticatedAccount = await gridClient.completeAuthAndCreateAccount({
                user: userPayload,
                otpCode: otpCode,
                sessionSecrets: session.sessionSecrets,
            });
        }
        console.log("\n📥 completeAuth response:", JSON.stringify(authenticatedAccount, null, 2));
        // Update session with signers and verified status on success
        if (authenticatedAccount.success && authenticatedAccount.data) {
            //@ts-ignore
            const authenticatedSigners = authenticatedAccount.data.signers || [];
            await gridsession_db_1.GridSession.findOneAndUpdate({ email }, {
                status: "verified",
                signers: authenticatedSigners,
                verifiedAt: new Date(),
            });
            // Check if user already exists to avoid duplicates
            const existingUser = await gridsession_db_1.GridUser.findOne({ email });
            if (!existingUser) {
                const saveUser = await gridsession_db_1.GridUser.create({
                    email,
                    fullName: session.fullName || email, // Use fullName from session or fallback to email
                    publicKey: authenticatedAccount.data.address,
                    gridId: authenticatedAccount.data.grid_user_id,
                });
                console.log("💾 User saved:", saveUser);
            }
            else {
                console.log("ℹ️  User already exists in database");
            }
            console.log("✅ Account verified successfully!");
            console.log(`   Signers saved: ${authenticatedSigners.length}`);
            return authenticatedAccount;
        }
        else {
            console.error("❌ Authentication failed:", authenticatedAccount.error);
            throw new Error(authenticatedAccount.error || "Authentication failed");
        }
    }
    catch (error) {
        console.error("❌ Error during OTP verification:", error);
        throw error;
    }
};
exports.verifyOtp = verifyOtp;
const createVirtualAccount = async (email) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    const user = await gridsession_db_1.GridUser.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    gridClient.requestKycLink;
    const gridUserId = user.gridId;
    const address = user.publicKey;
    const virtualAccount = await gridClient.requestVirtualAccount(address, {
        grid_user_id: gridUserId,
        currency: "usd",
    });
    console.log(virtualAccount);
    return virtualAccount;
};
exports.createVirtualAccount = createVirtualAccount;
const completeKYC = async (email) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    const user = await gridsession_db_1.GridUser.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const kyc = await gridClient.requestKycLink(user.publicKey, {
        grid_user_id: user.gridId,
        type: "individual",
        email: user.email,
        full_name: user.fullName,
        endorsements: [],
        redirect_uri: "https://myapp.com/kyc-complete",
    });
    const virtualAccount = await gridClient.requestVirtualAccount(user.publicKey, {
        grid_user_id: user.gridId,
        currency: "usd",
    });
    const virtualResponse = await gridClient.getVirtualAccounts(user.publicKey);
    console.log(JSON.stringify(virtualResponse.data, null, 2));
    console.log(virtualAccount);
    console.log(kyc);
    return kyc;
};
exports.completeKYC = completeKYC;
const getVirtualAccounts = async (email) => {
    const gridClient = new grid_1.GridClient({
        environment: "sandbox",
        apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl: "https://grid.squads.xyz",
    });
    const user = await gridsession_db_1.GridUser.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const virtualResponse = await gridClient.getVirtualAccounts(user.publicKey);
    console.log(JSON.stringify(virtualResponse.data, null, 2));
    return virtualResponse;
};
exports.getVirtualAccounts = getVirtualAccounts;
