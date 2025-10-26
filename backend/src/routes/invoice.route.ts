import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { GridUser } from '../gridsession.db';

const router = Router();

// Get all invoices for a merchant
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    // In a real app, you'd get merchantId from authenticated user token
    // For now, we'll get all invoices
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/invoices/create', async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency = 'USD',
      dueDate,
      payerEmail,
      payerName,
      description,
      items,
      merchantEmail, // We'll use this to find the merchant
    } = req.body;

    // Validate required fields
    if (!amount || !dueDate) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    // Find merchant by email (in a real app, use authenticated user)
    // For now, we'll use the first GridUser or create a dummy merchant ID
    let merchantId;
    
    if (merchantEmail) {
      const merchant = await GridUser.findOne({ email: merchantEmail });
      if (merchant) {
        merchantId = merchant._id;
      }
    }
    
    // If no merchant found, we'll still create the invoice with a placeholder
    // In production, this should come from authenticated user
    if (!merchantId) {
      // Get the first user or use a default
      const firstUser = await GridUser.findOne();
      merchantId = firstUser?._id;
    }

    // Create invoice
    const invoice = new Invoice({
      merchant: merchantId,
      amount,
      currency,
      dueDate: new Date(dueDate),
      payerEmail,
      payerName,
      description,
      items,
      status: 'pending',
      paymentLink: merchantId ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${merchantId}` : undefined,
    });

    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

// Update invoice status
router.patch('/invoices/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
});

export default router;
