"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const cors_1 = __importDefault(require("cors"));
const invoice_route_1 = __importDefault(require("./routes/invoice.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize database connection
(0, db_1.connectDB)().catch(err => {
    console.error("Failed to connect to database:", err);
});
app.use(express_1.default.json());
app.use(body_parser_1.default.json()); // for parsing application/json
app.use(body_parser_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://pay-orbit-frontend.vercel.app",
        "https://payorbit.live",
        /^https:\/\/.*\.vercel\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Mount invoice routes
app.use('/api/invoice', invoice_route_1.default);
app.use('/api/user', user_route_1.default);
// app.get('/', (req: Request, res: Response) => {
//     res.send('Hello World');
// });
// app.post('/create-account', async (req: Request, res: Response) => {
//     try {
//         const {email,fullName}=req.body;
//         const resp=await gridAccountCreation(email,fullName);
//         res.status(200).send(resp);
//     }
//     catch (error) {
//         console.error('Error during account creation:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
// app.post("/existing-account",async(req:Request,res:Response)=>{
//     try {
//         const {email}=req.body  
//         const data=await checkAndInitAuth(email);
//         res.status(200).send(data);
//     }
//     catch (error) {
//         console.error('Error during existing account verification:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })
// app.post("/verifyOtpExisting",async(req:Request,res:Response)=>{
//     try{
//         const {otpCode,email}=req.body;
//         await verifyOtpExisting(otpCode,email);
//         res.status(200).send('OTP verification for existing account process initiated. Check logs for details.');
//     }catch(error){
//         console.error('Error during OTP verification for existing account:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })
// app.post("/createVirtualAccount",async(req:Request,res:Response)=>{
//     try{
//         const {email}=req.body;
//         await virtualAccount(email);
//         res.status(200).send('Virtual account creation process initiated. Check logs for details.');
//     }catch(error){
//         console.error('Error during virtual account creation:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })
// app.post("/trackPayment",async(req:Request,res:Response)=>{
//     try{
//         const {invoiceId,user1address,expectedAmount}=req.body;
//         await trackPayment(invoiceId,user1address,expectedAmount);
//         res.status(200).send('Payment tracking process initiated. Check logs for details.');
//     }catch(error){
//         console.error('Error during payment tracking:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })
// app.post("/verify-otp", async (req: Request, res: Response) => {
//     try {
//         console.log('Received OTP verification request');
//         const { otpCode, email } = req.body;
//         // Verify OTP with Grid
//         const gridResponse = await verifyOtp(otpCode, email);
//         // Fetch user from database
//         const user = await GridUser.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found after verification' });
//         }
//         // Return response in format frontend expects
//         res.status(200).json({
//             success: true,
//             data: {
//                 user: {
//                     _id: user._id,
//                     email: user.email,
//                     fullName: user.fullName,
//                     gridUserId: user.gridId
//                 },
//                 gridResponse: gridResponse
//             }
//         });
//     }
//     catch (error) {
//         console.error('Error during OTP verification:', error);
//         res.status(500).json({ 
//             success: false,
//             message: error instanceof Error ? error.message : 'Internal Server Error' 
//         });
//     }
// })
// app.post("/kyc",async(req:Request,res:Response)=>{
//     try{
//         const {email}=req.body;
//         // Call KYC related functions here
//         await completeKYC(email);
//         // console.log(`KYC process initiated for email: ${email}`);
//         res.status(200).send('KYC process initiated. Check logs for details.');
//     }catch(error){
//         console.error('Error during KYC process:', error);
//         res.status(500).send('Internal Server Error');
//     }
// })
// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
// Export for Vercel serverless
exports.default = app;
