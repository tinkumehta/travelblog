import mongoose,{Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        username :{
            type: String,
            required : true,
            unique : true,
            index : true,
            lowerCase : true,
            trim : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            index : true,
        },
       
        refreshToken : {
            type : String,
            
        },
        password : {
            type : String,
            required : true,
        },
    }, 
    {timestamps : true})



 userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

 userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
 }


// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
        }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '2d'
        }
    );
};

export const User = mongoose.model("User", userSchema)