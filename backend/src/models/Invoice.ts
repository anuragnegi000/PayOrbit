import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  merchant: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payerEmail?: string;
  payerName?: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  paymentLink?: string;
  paidAt?: Date;
  transferId?: string;
  trackingStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GridUser',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    payerEmail: {
      type: String,
    },
    payerName: {
      type: String,
    },
    description: {
      type: String,
    },
    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
      },
    ],
    paymentLink: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    transferId: {
      type: String,
    },
    trackingStartedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
