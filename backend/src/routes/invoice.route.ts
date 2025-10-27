import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { GridUser } from '../gridsession.db';

const router = Router();

// Get all invoices for a merchant
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const { merchantEmail } = req.query;
    
    console.log('📊 GET /api/invoices - Request received');
    console.log('  merchantEmail:', merchantEmail);
    
    if (!merchantEmail) {
      console.log('❌ No merchantEmail provided');
      return res.status(400).json({ message: 'merchantEmail query parameter is required' });
    }

    // Find merchant by email
    const merchant = await GridUser.findOne({ email: merchantEmail });
    console.log('👤 Merchant lookup:', merchant ? `Found: ${merchant.email}` : 'Not found');
    
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Get invoices for this merchant only
    const invoices = await Invoice.find({ merchant: merchant._id }).sort({ createdAt: -1 });
    console.log('📋 Found', invoices.length, 'invoices for merchant:', merchant.email);
    console.log('  Merchant ID:', merchant._id);
    
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

    console.log('📝 POST /api/invoices/create - Request received');
    console.log('  merchantEmail:', merchantEmail);
    console.log('  amount:', amount, currency);

    // Validate required fields
    if (!amount || !dueDate) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    // Validate merchantEmail is provided
    if (!merchantEmail) {
      console.log('❌ No merchantEmail provided in request body');
      return res.status(400).json({ message: 'merchantEmail is required' });
    }

    // Find merchant by email
    const merchant = await GridUser.findOne({ email: merchantEmail });
    console.log('👤 Merchant lookup for invoice creation:', merchant ? `Found: ${merchant.email}` : 'Not found');
    
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found. Please ensure you are logged in.' });
    }

    const merchantId = merchant._id;

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
    
    console.log('✅ Invoice created successfully');
    console.log('  Invoice ID:', invoice._id);
    console.log('  Merchant ID:', merchantId);

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
