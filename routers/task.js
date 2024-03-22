const router = require('express').Router();
const jwt = require('jsonwebtoken')
const task = require('../models/taskModel');
const { jwtDecode } = require("jwt-decode");

router.route('/').get(async (req, res) => {

    const { authorization } = req?.headers
    console.log(authorization?.length)

    const { email, name } = jwtDecode(authorization)

    if (name && email) {

        try {
            // get user details

            const query = { user: { userName: name, email: email } };
            const resultObject = await task.find(query)

            // const checkedTasks = resultObject?.map(task => {

            //     const today = new Date()
            //     if(task?.due < today && task?.updatedAt){
            //         task["status"] = 'pending'
            //     }
            //     console.log(task)

            //     return(
            //         task
            //     )
            // })

            resultObject && res.status(200).json( resultObject )
        }
        catch (error) {
            res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        }
    }
    else {
        res.status(401).json({ message: 'UNAUTHORISED' })
    }
});

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
        console.log(x,id)

        const update ={
            $set: x
        } 

        const options = {
            new: true, // Return the modified document rather than the original
        };

        task?.findByIdAndUpdate(id,update,options).then(response => {
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


module.exports = router