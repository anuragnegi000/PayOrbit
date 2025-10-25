import { GridClient } from "@sqds/grid";
import { GridUser, Invoice, VirutalAccount } from "./gridsession.db";
import { randomUUID } from "crypto";

export async function virtualAccount(email: string): Promise<void> {
  try {
    const gridClient = new GridClient({
      environment: "sandbox",
      apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
      baseUrl: "https://grid.squads.xyz",
    });
    const user = await GridUser.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const address = user?.publicKey;
    const gridUserId = user?.gridId;

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
  console.log("✅ KYC Link Requested:", kyc);
    const resp = await gridClient.requestVirtualAccount(address, {
      grid_user_id: gridUserId,
      currency: "usd",
    });
    if (!resp.success || !resp.data) {
      throw new Error("Failed to create virtual account");
    }

    const virtualAccount = resp.data;

    const saveVirtualAccount = await VirutalAccount.create({
      _id: virtualAccount.id,
      customerId: virtualAccount.customer_id,
      sourceDepositInstructions: {
        currency: virtualAccount.source_deposit_instructions.currency,
        bankBeneficiaryName:
          virtualAccount.source_deposit_instructions.bank_beneficiary_name,
        bankName: virtualAccount.source_deposit_instructions.bank_name,
        bankAddress: virtualAccount.source_deposit_instructions.bank_address,
        bankRoutingNumber:
          virtualAccount.source_deposit_instructions.bank_routing_number,
        bankAccountNumber:
          virtualAccount.source_deposit_instructions.bank_account_number,
        paymentRails: virtualAccount.source_deposit_instructions.payment_rails,
      },
      destination: {
        currency: virtualAccount.destination.currency,
        paymentRail: virtualAccount.destination.payment_rail,
        address: virtualAccount.destination.address,
      },
      status: virtualAccount.status,
      developerFeePercent: virtualAccount.developer_fee_percent,
    });

    console.log("✅ Virtual Account Created:", virtualAccount);
    console.log("✅ Virtual Account Saved to DB:", saveVirtualAccount);
  } catch (error) {
    console.error("❌ Error creating virtual account:", error);
    throw error;
  }
}
