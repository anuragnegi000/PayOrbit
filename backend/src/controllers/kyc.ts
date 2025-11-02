import { GridClient } from "@sqds/grid";
import { GridUser } from "../gridsession.db";

export const initiateKYC=async(email:string)=>{
    const gridClient=new GridClient({
        environment:"sandbox",
        apiKey:"8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl:"https://grid.squads.xyz",
    });
    try{
        const userData=await GridUser.findOne({email});
        if(!userData){
            throw new Error("User not found");
        }
        const userId=userData._id.toString();
        const fullName=userData.fullName;
        const userAddress=userData.publicKey;
        const kycResponse=await gridClient.requestKycLink(userAddress,{
            grid_user_id:userId,
            type:'individual',
            email:email,
            full_name:fullName,
            redirect_uri:'https://payorbit.live/kyc-complete'
        })
        console.log("✅ KYC Link Requested:",kycResponse);
        if(!kycResponse.success || !kycResponse.data){
            throw new Error("Failed to initiate KYC");
        }
        await GridUser.findByIdAndUpdate(userId,{
            kycId:kycResponse.data.id
        });
        return kycResponse;
    }catch(error){
        console.error("Error initiating KYC:",error);
        throw error;
    }
}

export const kycStatusCheck=async(email:string)=>{
    const gridClient=new GridClient({
        environment:"sandbox",
        apiKey:"8508a9c6-9663-4f6c-b807-d307149b4585",
        baseUrl:"https://grid.squads.xyz",
    });
    try{

        const userData=await GridUser.findOne({email});
        if(!userData || !userData.kycId){
            throw new Error("KYC ID not found for user");
        }
        const userId=userData._id.toString();
        const account_address=userData.publicKey;
        const statusResponse=await gridClient.getKycStatus(account_address,userData?.kycId);
        console.log("✅ KYC Status Retrieved:",statusResponse);
        if(!statusResponse.success || !statusResponse.data){
            throw new Error("Failed to retrieve KYC status");
        }
        const response=await GridUser.findByIdAndUpdate(userId,{
            kycStatus:statusResponse.data.status
        });
        console.log("✅ KYC Status Updated in DB:",response);
        if(!statusResponse.success || !statusResponse.data){
            throw new Error("Failed to retrieve KYC status");
        }
        return statusResponse;
    }catch(error){
        console.error("Error checking KYC status:",error);
        throw error;
    }
}