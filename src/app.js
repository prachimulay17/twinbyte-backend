import express from 'express';

import cors from 'cors';
import analyzeRoute from "./routes/analyzeRoute.js";


const app = express();

app.use(cors({
    origin: process.env.CORSORIGIN
    
}))


app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb", extended:true}));
app.use(express.static("public"));

//router
app.use("/api", analyzeRoute);

export default app;