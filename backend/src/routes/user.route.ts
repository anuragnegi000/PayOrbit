import { Router } from "express";
import {gridAccountCreation, verifyOtp} from "../controllers/createAccount";
import { virtualAccount } from "../controllers/virtualAccount";

const router=Router();

router.post("/create-account",gridAccountCreation);
router.post("/verify-otp",verifyOtp);
router.post("/virtual-account",virtualAccount)

export default router;