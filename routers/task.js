const router = require('express').Router();
const jwt = require('jsonwebtoken')
const task = require('../models/taskModel');
const { jwtDecode } = require("jwt-decode");
const { getMessaging } = require('firebase-admin/messaging')
const { admin } = require('../controllers/firebase')


router.route('/').get(async (req, res) => {

    const { authorization } = req?.headers
    console.log(authorization)

    const { email, name } = jwtDecode(authorization)
    

    if (name && email) {

        try {
            // get user details

            const query = { 
                user: { userName: name, email: email } ,
               
            };

            const resultObject = await task.find(query)

            console.log(resultObject)

            resultObject && res.status(200).json(resultObject)
        }
        catch (error) {
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});

router.route('/due').get(async (req, res) => {
    const { authorization } = req?.headers
    console.log(authorization?.length)

    const { email, name } = jwtDecode(authorization)
    if (name && email) {

        try {
            // get user details

            const query = {
                user: {
                    userName: name,
                    email: email
                }
            };

            const resultObject = await task.find(query)



            const now = new Date()
            const nowTime = now.getTime()

            const notificationArray = resultObject?.filter(task => {

                const due = new Date(task?.due);
                const dueTime = due.getTime()

                const thirty_minute = 1800000
                // if Due is passed
                if(dueTime < nowTime){
                 return task
                }
                // due in 30 minutes or less
                if(dueTime - nowTime <= thirty_minute ){
                 return task 
                }
    
            })


            resultObject && res.status(200).json(notificationArray)
        }
        catch (error) {
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
})

router.route('/add').post(async (req, res) => {

    const { authorization } = req?.headers
    const { email, name } = jwtDecode(authorization)

    if (email && name) {

        try {
            // get user details

            const { title, description, status, due } = req?.body

            const newTask = new task({
                user: {
                    userName: name,
                    email: email
                },
                title: title,
                description: description,
                status: status,
                due: due
            });

            const taskResponse = await newTask.save();
            console.log(taskResponse)
            res.status(200).send("task added")

        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});

router.route('/update/:id').patch(async (req, res) => {

    const { authorization } = req?.headers

    if (authorization) {

        const { email, name } = jwtDecode(authorization)
        const { id } = req?.params

        const x = req?.body
        console.log(x, id)

        const update = {
            $set: x
        }

        const options = {
            new: true, // Return the modified document rather than the original
        };

        task?.findByIdAndUpdate(id, update, options).then(response => {
            console.log(response)
            res.status(200).json(response)
        })
            .catch(err => {
                console.log(err)
                res.status(400).send('ERR_BAD_REQUEST')
            })
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});

router.route('/remove').delete(async (req, res) => {

    const { authorization } = req?.headers
    console.log(authorization)
    const { email, name } = jwtDecode(authorization)
    

    if (email && name) {

        try {
            // get user details
            const ids = req?.body
            const query = {
                user: { userName: name, email: email },
                _id: { $in: [...ids] }
            };

            const deleteResult = await task?.deleteMany(query)
            console.log(deleteResult)
            deleteResult && res.status(200).send("deleted")

        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});

router.route('/complete').patch(async (req, res) => {

    const { authorization } = req?.headers
    const { email, name } = jwtDecode(authorization)

    if (email && name) {

        try {
            // get user details
            const ids = req?.body
            const filter = {
                user: { userName: name, email: email },
                _id: { $in: [...ids] }
            };

            const update = {
                $set : {
                    status:'completed'
                }
            }

            const completeResult = await task?.updateMany(filter,update)
            console.log(completeResult )
            completeResult  && res.status(200).send("task completed")

        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});


module.exports = router