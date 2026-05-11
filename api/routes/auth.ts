import { Router } from "express"
export const routerforauth = Router()
import bcrypt from 'bcrypt'
import { pgClient } from "../db"
import jwt from "jsonwebtoken"
import { apiRedisManager } from "../redismanager"
import { authmiddleware } from "../middleware"

routerforauth.post("/signup" , async (req,res) => {
       const { username , email , password} = req.body ;
      try{
          const hashedpassword = await bcrypt.hash(password,10)
          const response = await pgClient.query(`INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING userId , email`,[username,email,hashedpassword])
          const userId = response.rows[0].userid
          const token =  jwt.sign(
              { userId : userId },
              process.env.JWT_SECRET as string,
              { expiresIn : "24h" }
            )
          const engineresponse =  apiRedisManager.getinstance().sendAndAwait({
               type : "ON_RAMP" ,
               data : {
                   userId : userId,
                   amount : "0",
                   asset : ""
               }
          }) 

          res.json({
              msg : "user created sucessfully",
              token,
              user: {
              userid :   response.rows[0].userid ,
              email :   response.rows[0].email
              }
          })

        }catch(err :any){
            if (err.code === '23505') {
              return res.status(400).json({ msg: "Email or username already exists" });
             }
            res.status(500).json({
            msg : "system error",
            err  : err.message
          })
        } 

})

routerforauth.post("/signin",async(req,res)=>{
    const { email , password  } = req.body
    try{
        const response = await pgClient.query(`SELECT * FROM users WHERE email=$1 `,[email])
        if(response.rows.length == 0) return res.status(401).json({msg : "incorrect username or password"})
            const user = response.rows[0]
        const hashed  = user.password_hash

        const test = await bcrypt.compare( password , hashed )
        if (!test) return res.status(401).json({msg : "incorrect username or password"})

        const token = jwt.sign(
            {userId : user.userid},
            process.env.JWT_SECRET || "123sec",
            { expiresIn : "24h"}
        ) 
        res.json({
            msg : "logged in sucessfully",
            token,
            user : { id : user.userid , username : user.username }
        })
    }catch(err:any){
        res.status(500).json({
            msg : "internal server error"
        })
    }
 
})

routerforauth.get("/me", authmiddleware ,async(req,res)=>{
        const userId = (req as any).userId  
        try{
          const response = await pgClient.query(`SELECT username, email FROM users WHERE userId=$1`,[userId])
          res.json(response.rows[0])
        }catch(err){
            res.status(500).json({
            msg : "internal server error"
        })
        }
})