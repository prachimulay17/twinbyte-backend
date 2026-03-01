
import express from 'express';
import app from './app.js';
import connectDB from './db/index.js';
import { startCleanupCron } from './utils/cleanup.cron.js';



const PORT = process.env.PORT || 8000;


connectDB();
startCleanupCron();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



