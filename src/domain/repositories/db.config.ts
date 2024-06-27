import "dotenv/config";
import mongoose from "mongoose";

const mongoUri: string = process.env.MONGO_URI!;

console.log(mongoUri)
mongoose.connect(mongoUri)
    .then(()=> console.log("successfully connected to the database"))
    .catch(e=>console.log(e))