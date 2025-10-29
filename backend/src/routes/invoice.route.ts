import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { GridUser } from '../gridsession.db';
import { createInvoice, deleteInvoice, invoiceById, invoices, updateInvoiceStatus } from '../controllers/invoice';
import { startTrackPayment, stopTrackPayment, getTrackingStatus } from '../controllers/trackPayment';

const router = Router();

// Get all invoices for a merchant
router.get('/',invoices);

// Get invoice by ID
router.get('/:id', invoiceById);

// Create new invoice
router.post('/create', createInvoice);

// Update invoice status
router.patch('/:id/status', updateInvoiceStatus);

// Delete invoice
router.delete('/:id', deleteInvoice);

// Payment tracking routes
router.post('/track/start', startTrackPayment);
router.post('/track/stop/:invoiceId', stopTrackPayment);
router.get('/track/status/:invoiceId', getTrackingStatus);

export default router;
