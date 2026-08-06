const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...",process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;