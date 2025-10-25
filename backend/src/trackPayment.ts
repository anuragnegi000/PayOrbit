import { GridClient } from "@sqds/grid";
import { GridUser, Invoice, VirutalAccount } from "./gridsession.db";
import { randomUUID } from "crypto";

export const trackPayment=async(invoiceId:string,user1address:string,expectedAmount:string):Promise<void>=>{
    try {
        // const invoice = await Invoice.findOne({invoiceId:invoiceId});
        // if (!invoice) {
        //   throw new Error("Invoice not found");
        // }
    
        const gridClient = new GridClient({
          environment: "sandbox",
          apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
          baseUrl: "https://grid.squads.xyz",
        });
        const transfers = await gridClient.getTransfers(user1address);
        if (!transfers.success || !transfers.data) {
          throw new Error("Failed to fetch transfers");
        }
        const matchingPayment = transfers.data.find(t => 
        parseFloat(t.amount) === parseFloat(expectedAmount)
      );

      if (matchingPayment) {
        // Update invoice in database
        await Invoice.updateOne(
          { _id: invoiceId },
          { 
            status: "paid", 
            paidAt: new Date(),
            transactionId: matchingPayment.id
          }
        );
        console.log(`Payment received: ${matchingPayment.amount} USDC`);
      }

    }
    catch (error) {
        console.error("Error tracking payment:", error);
    }
}