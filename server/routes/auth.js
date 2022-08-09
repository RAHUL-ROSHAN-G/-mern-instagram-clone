const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User  = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//two folder up so ..
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport') 

// const transporter = nodemailer.createTransport(sendgridTransport({
// 	//service: 'Gmail',
//     auth:{
//         api_key:'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'
//     }
// }))


//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

router.post('/signup',(req,res)=>{
	const {name,email,password,pic} = req.body
	if(!email || !password || !name){
		return res.status(422).json({error:"please add all the fields"})
	}
	User.findOne({email:email})
	.then((savedUser)=>{
		if(savedUser){
			return res.status(422).json({error:"user already exits with that email."})
		}
		bcrypt.hash(password,12)
		.then(hashedpassword=>{
			const user = new User({
			email,
			password:hashedpassword,
			name,
			pic
			})
			user.save()
			.then(user=>{
				// transporter.sendMail({
    //                 from:"no-reply@insta.com",
    //                 to:user.email,
    //                 subject:"signup success",
    //                 html:"<h1>welcome to instagram</h1>"
    //             })
				res.json({message:"saved successfully"})
			})
			.catch(err=>{
				console.log(err)
			})	
		})
		
	})
	.catch(err=>{
		console.log(err)
	})
})

router.post('/signin',(req,res)=>{
	const {email,password} = req.body
	if(!email || !password){
		return res.status(422).json({error:"please add the email or password"})
	}
	User.findOne({email:email})
	.then(savedUser=>{
		if(!savedUser){
			return res.status(422).json({error:"Invalid email or password"})
		}
		bcrypt.compare(password,savedUser.password)//return bollean values
		.then(doMatch=>{
			if(doMatch){
				//res.json({message:"successfully signed in!"})
				const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
				const {_id,name,email,followers,following,pic} = savedUser
				res.json({token,user:{_id,name,email,followers,following,pic}}) //res.json({token:token}) so condensed
			}
			else{
				return res.status(422).json({error:"Invalid email or password"})				
			}
		})
		.catch(err=>{
			console.log(err)
		})
	})
})

module.exports = router