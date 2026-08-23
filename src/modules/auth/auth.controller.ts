import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from '../../utils/ApiError.js'
import redis from "../../config/redis.js";
import { registerUser } from "./auth.services.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const userRegister = asyncHandler(async(req, res)=>{
    const {name, email, password} = req.body
    const result = await registerUser({
        name, email, password
    })
    return res.status(201).json(new ApiResponse({message:"User registered successfully", data:result}))
})
export const userLogin = asyncHandler(async(req, res)=>{
    const result = await redis.ping()
    res.status(200).json({message:result})
})