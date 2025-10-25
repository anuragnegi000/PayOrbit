import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript
export interface IGridSession extends Document {
  email: string;
  fullName?: string;    // Optional full name
  sessionSecrets: any; // Store the Grid session secrets
  signers: any[];      // Store the signers array from account creation
  otpSentAt: Date;      // When OTP was sent
  expiresAt: Date;      // When OTP/session secrets expire
  status: "pending_verification" | "verified" | "pending_login";
}

export interface IinvoiceSchema extends Document {
  invoiceId: string;
  from:string;
  to:string;
  amount:number;
  currency:string;
  status:string;
  paymentInstructions:{
    bankName:string;
    routingNumber:string;
    accountNumber:string;
    beneficiaryName:string;
  }
  destinationAddress:string;
  createdAt: Date;
  paidAt: Date;
  transactionId: string;
}

export interface IGridUser{
  fullName:string;
  email: string;
  publicKey:string;
  gridId:string;
}

export interface IVirtualAccount extends Document {
  _id: string;
  customerId: string;
  sourceDepositInstructions: {
    currency: string;
    bankBeneficiaryName: string;
    bankName: string;
    bankAddress: string;
    bankRoutingNumber: string;
    bankAccountNumber: string;
    paymentRails: string[];
  };
  destination: {
    currency: string;
    paymentRail: string;
    address: string;
  };
  status: 'activated' | 'pending' | 'deactivated';
  developerFeePercent: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VirtualAccountSchema = new Schema<IVirtualAccount>(
  {
    _id: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    sourceDepositInstructions: {
      currency: {
        type: String,
        required: true,
        uppercase: true,
      },
      bankBeneficiaryName: {
        type: String,
        required: true,
      },
      bankName: {
        type: String,
        required: true,
      },
      bankAddress: {
        type: String,
        required: true,
      },
      bankRoutingNumber: {
        type: String,
        required: true,
      },
      bankAccountNumber: {
        type: String,
        required: true,
        unique: true,
      },
      paymentRails: {
        type: [String],
        required: true,
        default: [],
      },
    },
    destination: {
      currency: {
        type: String,
        required: true,
        uppercase: true,
      },
      paymentRail: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['activated', 'pending', 'deactivated'],
      default: 'pending',
    },
    developerFeePercent: {
      type: Number,
      required: true,
      default: 0.0,
    },
  },
  {
    _id: false, // Disable auto-generation of _id since we're providing it
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const InvoiceSchema: Schema = new Schema<IinvoiceSchema>({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  from:{
    type: String,
    required: true
  },
  to:{
    type: String,
    required: true
  },
  amount:{
    type: Number,
    required: true
  },
  currency:{
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  },
  paymentInstructions:{
    bankName:{type:String,required:true},
    routingNumber:{type:String,required:true},
    accountNumber:{type:String,required:true},
    beneficiaryName:{type:String,required:true}
  },
  destinationAddress:{
    type: String,
    required: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  paidAt:{
    type: Date,
  },
  transactionId:{
    type: String,
  }
})


// Schema definition
const GridSessionSchema: Schema = new Schema<IGridSession>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: false,
  },
  sessionSecrets: {
    type: Schema.Types.Mixed, // Can store array/object of session secrets
    required: true,
  },
  signers: Schema.Types.Mixed, // Array of signer objects
  otpSentAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending_verification", "verified", "pending_login"],
    default: "pending_verification",
  },
});

GridSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });





const GridUserSchema: Schema = new Schema<IGridUser>({
  fullName:{
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  gridId: {
    type: String,
    required: true,
  },
});


export const GridUser = mongoose.model<IGridUser>(
  "GridUser",
  GridUserSchema
);

export const GridSession = mongoose.model<IGridSession>(
  "GridSession",
  GridSessionSchema
);

export const Invoice = mongoose.model<IinvoiceSchema>(
  "Invoice",
  InvoiceSchema
);

export const VirutalAccount=mongoose.model<IVirtualAccount>(
  "VirtualAccount",
  VirtualAccountSchema
)