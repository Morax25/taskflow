import express from 'express'
import { env } from './config/env.js';

const app = express()

app.get('/', async(req,res)=>{
    console.log("route hit")
    return res.status(200).json({message:"Server is up and running"})
})

export default app;