import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSendCookie } from "../utils/generateToken.js"

export const signup = async(req, res)=>{
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({success: false, message: 'Invalid email'});
        }

        if(password.length < 6){
            return res.status(400).json({success: false, message: 'Password must be at least 6 characters long'});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success: false, message: 'Email already in use'});
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({success: false, message: 'Username already in use'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const PROFILE_PIC = ['avatar1.png', 'avatar2.png', 'avatar3.png'];

        const image = PROFILE_PIC[Math.floor(Math.random() * PROFILE_PIC.length)]; 

        const newUser = new User({
            username, 
            email, 
            password: hashedPassword, 
            image 
        });
        
        
        await newUser.save();
        generateTokenAndSendCookie(newUser._id, res);
        return res.status(201).json({success: true, message: 'User created successfully', user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            image: newUser.image,
        }});
    } catch (error) {
        console.log("Error in signup:", error.message);
        res.status(500).json({success: false, message: 'Server error'});
    }
}
export const login = async(req, res)=>{
      try{
            const {email, password} = req.body;
            if(!email || !password){
                    return res.status(400).json({success: false, message: 'Missing required fields'});
            }
    
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({success: false, message: 'Invalid email or password'});
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({success: false, message: 'Invalid email or password'});
            }
    
            generateTokenAndSendCookie(user._id, res);

    console.log('Cookie being set for user:', user._id);
    console.log('NODE_ENV:', process.env.NODE_ENV);
            return res.status(200).json({success: true, message: 'Logged in successfully', user: {
                id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
            }});
      }catch(error){
            console.log("Error in login:", error.message);
            res.status(500).json({success: false, message: 'Server error'});
      }
}
export const logout = async(req, res)=>{
    try{
        res.clearCookie('authToken');
        return res.status(200).json({success: true, message: 'Logged out successfully'});
    }catch(error){
        console.log("Error in logout:", error.message);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in getMe:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};