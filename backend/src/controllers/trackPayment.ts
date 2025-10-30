import { GridClient } from "@sqds/grid";
import { GridUser, VirutalAccount } from "../gridsession.db";
import { Invoice } from "../models/Invoice";
import { Request, Response } from "express";

// Store active tracking intervals
const activeTrackers = new Map<string, NodeJS.Timeout>();

export const startTrackPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'invoiceId is required' 
      });
    }

    // Find the invoice
    const invoice = await Invoice.findById(invoiceId).populate('merchant');
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice is already paid' 
      });
    }

    // Get merchant's Grid address
    //@ts-ignore
    const merchant = invoice.merchant as any;
    const merchantAddress = merchant.publicKey;

    if (!merchantAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Merchant Grid address not found' 
      });
    }

    // Stop any existing tracker for this invoice
    if (activeTrackers.has(invoiceId)) {
      clearInterval(activeTrackers.get(invoiceId)!);
    }

    // Update invoice to mark tracking started
    await Invoice.findByIdAndUpdate(invoiceId, {
      trackingStartedAt: new Date()
    });

    // Start tracking
    const trackerId = startTracking(
      invoiceId,
      merchantAddress,
      invoice.amount.toString()
    );

    activeTrackers.set(invoiceId, trackerId);

    console.log(`✅ Payment tracking started for invoice: ${invoiceId}`);
    console.log(`   Merchant address: ${merchantAddress}`);
    console.log(`   Expected amount: ${invoice.amount} ${invoice.currency}`);

    return res.status(200).json({
      success: true,
      message: 'Payment tracking started',
      data: {
        invoiceId,
        merchantAddress,
        expectedAmount: invoice.amount,
        currency: invoice.currency
      }
    });

  } catch (error: any) {
    console.error('Error starting payment tracking:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to start payment tracking'
    });
  }
};

export const stopTrackPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;

    if (activeTrackers.has(invoiceId)) {
      clearInterval(activeTrackers.get(invoiceId)!);
      activeTrackers.delete(invoiceId);
      
      return res.status(200).json({
        success: true,
        message: 'Payment tracking stopped'
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No active tracking found for this invoice'
    });

  } catch (error: any) {
    console.error('Error stopping payment tracking:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to stop payment tracking'
    });
  }
};

export const getTrackingStatus = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    const isTracking = activeTrackers.has(invoiceId);

    return res.status(200).json({
      success: true,
      data: {
        invoiceId,
        status: invoice.status,
        isTracking,
        trackingStartedAt: invoice.trackingStartedAt,
        paidAt: invoice.paidAt,
        transferId: invoice.transferId
      }
    });

  } catch (error: any) {
    console.error('Error getting tracking status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tracking status'
    });
  }
};

// Internal tracking function
function startTracking(
  invoiceId: string,
  merchantAddress: string,
  expectedAmount: string
): NodeJS.Timeout {
  const gridClient = new GridClient({
    environment: "sandbox",
    apiKey: "8508a9c6-9663-4f6c-b807-d307149b4585",
    baseUrl: "https://grid.squads.xyz"
  });

  const intervalMs = 15000; // Check every 15 seconds

  const intervalId = setInterval(async () => {
    try {
      console.log(`🔍 Checking payments for invoice: ${invoiceId}`);
      
      const transfers = await gridClient.getTransfers(merchantAddress, {
        status: "payment_processed",
        limit: 10,
      });

      if (!transfers.success || !transfers.data) {
        console.log('   No transfers found');
        return;
      }

      console.log(`   Found ${transfers.data.length} processed transfers`);

      const matchingPayment = transfers.data.find((t: any) =>
        parseFloat(t.amount) === parseFloat(expectedAmount)
      );

      if (matchingPayment) {
        console.log(`💰 Payment matched! Amount: ${matchingPayment.amount}`);
        
        await Invoice.findByIdAndUpdate(invoiceId, {
          status: "paid",
          paidAt: new Date(),
          transferId: matchingPayment.id
        });

        console.log(`✅ Invoice ${invoiceId} marked as paid`);
        
        // Stop tracking
        clearInterval(intervalId);
        activeTrackers.delete(invoiceId);
      }
    } catch (error) {
      console.error("Payment tracking error:", error);
    }
  }, intervalMs);

  return intervalId;
}