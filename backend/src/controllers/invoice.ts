import { GridClient } from "@sqds/grid";
import { GridUser, VirutalAccount } from "../gridsession.db";
import { Invoice } from "../models/Invoice";
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
    // const resp = await gridClient.requestVirtualAccount(address, {
    //   grid_user_id: gridUserId,
    //   currency: "usd",
    // });

    // if (!resp.success || !resp.data) {
    //   throw new Error("Failed to create virtual account");
    // }

    // const virtualAccount = resp.data;

    const invoiceId = randomUUID();

    const data=await VirutalAccount.findOne({customerId:gridUserId,currency:currency});
    if(!data){
      throw new Error("Virtual Account not found for the user");
    }
    const newInvoice = new Invoice({
      invoiceId: invoiceId,
      virtualAccountId: data.id, 
      customerId: data.customerId,
      amount: amount,
      currency: currency,
      description: description,
      customerEmail: customerEmail,
      status: "pending",
      bankDetails: {
        bankName: data.sourceDepositInstructions.bankName,
        accountNumber: data.sourceDepositInstructions.bankAccountNumber,
        routingNumber: data.sourceDepositInstructions.bankRoutingNumber,
        beneficiaryName: data.sourceDepositInstructions.bankBeneficiaryName,
        bankAddress: data.sourceDepositInstructions.bankAddress,
      },
      destination: {
        address: data.destination.address,
        currency: data.destination.currency,
        paymentRail: data.destination.paymentRail,
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