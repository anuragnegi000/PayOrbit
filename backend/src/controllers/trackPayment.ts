import { GridClient } from "@sqds/grid";
import { GridUser, VirutalAccount } from "../gridsession.db";
import { Invoice } from "../models/Invoice";
import { randomUUID } from "crypto";

export const trackPayment = (
  invoiceId: string,
  user1address: string,
  expectedAmount: string
): NodeJS.Timeout => {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "your-api-key",
    baseUrl: "https://grid-api-sandbox.squads.xyz"
  });
    const intervalMs = 15000; 
  const intervalId = setInterval(async () => {
    try {
      const transfers = await gridClient.getTransfers(user1address, {
        status: "payment_processed",
        limit: 10,
      });

      if (!transfers.success || !transfers.data) return;

      const matchingPayment = transfers.data.find(t =>
        parseFloat(t.amount) === parseFloat(expectedAmount)
      );

      if (matchingPayment) {
        await Invoice.updateOne(
          { _id: invoiceId },
          {
            status: "paid",
            paidAt: new Date(),
            transferId: matchingPayment.id
          }
        );
        
        console.log(`Payment received: ${matchingPayment.amount}`);
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error("Tracking error:", error);
    }
  }, intervalMs);

  return intervalId; 
};