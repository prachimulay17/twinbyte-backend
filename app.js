import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORSORIGIN
    
}))

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb", extended:true}));
app.use(express.static("public"));


export default app;