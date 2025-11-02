"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirutalAccount = exports.GridSession = exports.GridUser = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VirtualAccountSchema = new mongoose_1.Schema({
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
}, {
    _id: false, // Disable auto-generation of _id since we're providing it
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Schema definition
const GridSessionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed, // Can store array/object of session secrets
        required: true,
    },
    signers: mongoose_1.Schema.Types.Mixed, // Array of signer objects
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
const GridUserSchema = new mongoose_1.Schema({
    fullName: {
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
    kycId: {
        type: String,
        required: true,
    },
    kycStatus: {
        type: String,
        required: false,
    },
    gridId: {
        type: String,
        required: true,
    },
});
exports.GridUser = mongoose_1.default.model("GridUser", GridUserSchema);
exports.GridSession = mongoose_1.default.model("GridSession", GridSessionSchema);
exports.VirutalAccount = mongoose_1.default.model("VirtualAccount", VirtualAccountSchema);
