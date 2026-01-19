import mongoose, { mongo } from "mongoose"


export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB)
        console.log("mongoDB connected sucessfully");
        
    } catch (error) {
        console.error("error connecting to mongo db", error)
    }
}