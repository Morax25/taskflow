import express from 'express'

const app = express()

app.get('/', async(req,res)=>{
    console.log("route hit")
    return res.status(200).json({message:"Server is up and running"})
})

export default app;