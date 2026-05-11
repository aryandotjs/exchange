import jwt from "jsonwebtoken"
export const authmiddleware=(req : any ,res : any ,next :any)=>{
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.json({msg : "no token // not a user account"}) 
    try{
       const decoded : any = jwt.verify( token, process.env.JWT_SECRET as string);
       req.userId  = decoded.userId as string
       next()
    }catch(err){
        res.json({error : "token not valid"})
    }    
}