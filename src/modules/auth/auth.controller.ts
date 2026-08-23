import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from '../../utils/ApiError.js'
import redis from "../../config/redis.js";

export const userRegister = asyncHandler(async(req, res)=>{
    res.end(201)
})

export const userLogin = asyncHandler(async(req, res)=>{
    const result = await redis.ping()
    res.status(200).json({message:result})
})