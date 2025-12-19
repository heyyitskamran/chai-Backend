import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connect = await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
        console.log(`MongooDB connected !! DB HOST: ${connect.connection.host}`)
    }
    catch(error){
        console.log("Mongodb Connection error ", error)
        process.exit(1)
    }
}

export default connectDB;