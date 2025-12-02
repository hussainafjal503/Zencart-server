import { logger } from "./logger";
import jwt from "jsonwebtoken";
import crypto from "crypto";




const generateToken=({userId, role})=>{
try{
	 const secret = new TextEncoder().encode(process.env.SECRET_KEY);
		  const payload = {
			userId,
			role,
		  };
		  const accessToken = jwt.sign(payload, secret, {
			expiresIn: 1 * 60 * 60 * 1000,
		  });
		  const refreshToken = crypto.randomBytes(20).toString("hex");

		  if(!refreshToken || !accessToken) throw new Error("Internal Sever Error")

			return {accessToken,refreshToken}
		}catch(err){
			logger.log("ERROR OCCURED WHILE GENERATING TOKEN :: ",err);
			throw err;
		}
		  
}

export default generateToken;