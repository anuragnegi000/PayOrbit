import { GridClient } from "@sqds/grid";
import { GridUser, Invoice } from "./gridsession.db";
import { randomUUID } from "crypto";

export async function createInvoice(
  email: string,
  gridClient: GridClient,
  amount: number,
  currency: string,
  description: string,
  customerEmail: string
): Promise<string> {
  try {
    const user = await GridUser.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    
    const address = user?.publicKey;
    const gridUserId = user?.gridId;

    // Request virtual accounts from Grid
    const resp = await gridClient.requestVirtualAccount(address, {
      grid_user_id: gridUserId,
      currency: "usd",
    });

    if (!resp.success || !resp.data) {
      throw new Error("Failed to create virtual account");
    }

    const virtualAccount = resp.data;

    const invoiceId = randomUUID();

    const newInvoice = new Invoice({
      invoiceId: invoiceId,
      virtualAccountId: virtualAccount.id, 
      customerId: virtualAccount.customer_id,
      amount: amount,
      currency: currency,
      description: description,
      customerEmail: customerEmail,
      status: "pending",
      bankDetails: {
        bankName: virtualAccount.source_deposit_instructions.bank_name,
        accountNumber: virtualAccount.source_deposit_instructions.bank_account_number,
        routingNumber: virtualAccount.source_deposit_instructions.bank_routing_number,
        beneficiaryName: virtualAccount.source_deposit_instructions.bank_beneficiary_name,
        bankAddress: virtualAccount.source_deposit_instructions.bank_address,
      },
      destination: {
        address: virtualAccount.destination.address,
        currency: virtualAccount.destination.currency,
        paymentRail: virtualAccount.destination.payment_rail,
      },
      createdAt: new Date(),
    });

    await newInvoice.save();

    return invoiceId;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}