"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_1 = require("../controllers/invoice");
const trackPayment_1 = require("../controllers/trackPayment");
const router = (0, express_1.Router)();
// Get all invoices for a merchant
router.get('/', invoice_1.invoices);
// Get invoice by ID
router.get('/:id', invoice_1.invoiceById);
// Create new invoice
router.post('/create', invoice_1.createInvoice);
// Update invoice status
router.patch('/:id/status', invoice_1.updateInvoiceStatus);
// Delete invoice
router.delete('/:id', invoice_1.deleteInvoice);
// Payment tracking routes
router.post('/track/start', trackPayment_1.startTrackPayment);
router.post('/track/stop/:invoiceId', trackPayment_1.stopTrackPayment);
router.get('/track/status/:invoiceId', trackPayment_1.getTrackingStatus);
exports.default = router;
