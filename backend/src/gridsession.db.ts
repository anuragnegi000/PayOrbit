import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript
export interface IGridSession extends Document {
  email: string;
  sessionSecrets: any; // Store the Grid session secrets
  signers: any[];      // Store the signers array from account creation
  otpSentAt: Date;      // When OTP was sent
  expiresAt: Date;      // When OTP/session secrets expire
  status: "pending_verification" | "verified";
}

// Schema definition
const GridSessionSchema: Schema = new Schema<IGridSession>({
  email: {
    type: String,
    required: true,
    unique: true,
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
    enum: ["pending_verification", "verified"],
    default: "pending_verification",
  },
});

GridSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const GridSession = mongoose.model<IGridSession>(
  "GridSession",
  GridSessionSchema
);

export interface IGridUser{
  fullName:string;
  email: string;
  publicKey:string;
  gridId:string;
}

const GridUserSchema: Schema = new Schema<IGridUser>({
  fullName:{
    type: String,
    required: true
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