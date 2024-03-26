const router = require('express').Router();
const jwt = require('jsonwebtoken')
const deviceTokens = require('../models/deviceTokenModel')
const { jwtDecode } = require("jwt-decode");
const { getMessaging } = require('firebase-admin/messaging')
const {admin} = require('../controllers/firebase')

router.route('/').post(async(req,res)=>{

    const { authorization } = req?.headers
    const { email, name } = jwtDecode(authorization)

    if (email && name) {

        try {
            // get user details

            const {token} = req?.body

            const newDeviceToken = new deviceTokens({
                user_email : email,
                deviceTokenId : token
            });

            
            const tokenResponse = await newDeviceToken.save();
            console.log(tokenResponse)
            res.status(200).send("token added")

        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
})

router.route('/').get(async(req,res)=>{

    const { authorization } = req?.headers
    const { email, name } = jwtDecode(authorization)

    if (email && name) {

        try {
            // get user details

            const query = {
                user_email : email
            }

            const resultObject = await  deviceTokens.find(query)
            console.log(resultObject)
            res.status(200).json(resultObject)

        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
})



module.exports = router