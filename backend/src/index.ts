import express, { Request, Response } from 'express';
import { completeKYC, createVirtualAccount, gridAccountCreation, verifyOtp, verifyOtpExisting} from "./grid"
import bodyParser from "body-parser";
import {connectDB} from "./db"

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();

app.use(express.json());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.post('/create-account', async (req: Request, res: Response) => {
    try {
        const {email,fullName}=req.body;
        await gridAccountCreation(email,fullName);
        res.status(200).send('Account creation process initiated. Check logs for details.');
    }
    catch (error) {
        console.error('Error during account creation:', error);
        res.status(500).send('Internal Server Error');
    }
});

// app.post("/existing-account",async(req:Request,res:Response)=>{
//     try {
//         const {email}=req.body
//         await existingVerfication(email);
//         res.status(200).send('Existing account verification process initiated. Check logs for details.');
//     }
//     catch (error) {
//         console.error('Error during existing account verification:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })


app.post("/verifyOtpExisting",async(req:Request,res:Response)=>{
    try{
        const {otpCode,email}=req.body;
        await verifyOtpExisting(otpCode,email);
        res.status(200).send('OTP verification for existing account process initiated. Check logs for details.');
    }catch(error){
        console.error('Error during OTP verification for existing account:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post("/createVirtualAccount",async(req:Request,res:Response)=>{
    try{
        const {email}=req.body;
        await createVirtualAccount(email);
        res.status(200).send('Virtual account creation process initiated. Check logs for details.');
    }catch(error){
        console.error('Error during virtual account creation:', error);
        res.status(500).send('Internal Server Error');
    }
})


app.post("/verify-otp", async (req: Request, res: Response) => {
    try {
        console.log('Received OTP verification request');
        const { otpCode, email } = req.body;
        await verifyOtp(otpCode,email);
        res.status(200).send('OTP verification process initiated. Check logs for details.');
    }
    catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post("/kyc",async(req:Request,res:Response)=>{
    try{
        const {email}=req.body;
        // Call KYC related functions here
        await completeKYC(email);
        // console.log(`KYC process initiated for email: ${email}`);
        res.status(200).send('KYC process initiated. Check logs for details.');
    }catch(error){
        console.error('Error during KYC process:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

})();
