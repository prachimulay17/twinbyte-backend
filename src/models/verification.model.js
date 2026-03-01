import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["text", "image"],
        required: true,
    },
    inputText: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        default: null,
    },
    aiResult: {
        type: String,
        required: true,
    },
    explanation: {
    type: String
},
    riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
