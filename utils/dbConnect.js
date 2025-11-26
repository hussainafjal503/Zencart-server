import mongoose from "mongoose";

let cache=global.mongoose;

if(!cache){
  cache=global.mongoose={
    conn:null,
    promise:null
  }
}

async function dbConnect() {
  if(cache.conn) return cache.conn;

  try {
    if(!cache.promise){
      cache.promise=mongoose.connect(process.env.MONGO_URI,{
        bufferCommands:false
      })
    }

    cache.conn=await cache.promise;
    console.log("db Connected.. successFully...")
    return cache.conn;
    // await mongoose.connect(process.env.MONGO_URI);
    // console.log("Db Connected SuccessFully...");
  } catch (err) {
    console.log("unable to connect with DB ==> ", err);
    throw new Error("Unable to Connect DB");
  }
}

export default dbConnect;
