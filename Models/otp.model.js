import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

email:{
	type:String,
	required:true,
},
otp:{
	type:String,
	required:true,
},
expiredAt:{
	type:Date,
	required:true,
	default:()=>new Date(Date.now()+10*60*1000)
}
},{timestamps:true});

// ttl time to leave features

otpSchema.index({expiredAt:1},{expireAfterSeconds:0})


const OTPModel =mongoose.model.OTP || mongoose.model("OTP", otpSchema, "otps");
export default OTPModel;
