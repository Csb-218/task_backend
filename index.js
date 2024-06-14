const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const task = require("./models/taskModel")
const deviceTokens = require('./models/deviceTokenModel')
const { getMessaging } = require('firebase-admin/messaging')
const { initializeApp , applicationDefault } = require('firebase-admin/app');
var cron = require('node-cron');

require('dotenv').config();

const port =  3001;
const uri = process.env.DB_URI; 

// process.env.GOOGLE_APPLICATION_CREDENTIALS;


const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } }; 

//Connecting to server
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.listen(port, () => {
    console.log(`server listening on ${port}`); 
});

//connecting to database 


mongoose.connect(uri);
console.log(uri)   

const connection  = mongoose.connection;
connection.once('open', () => {console.log("MongoDB database connection established successfully")});

//Home
app.get('/', (req, res) => {
    res.send('welcome to task app server')   
})

// imports 
const taskRouter = require("./routers/task")
const deviceTokenRouter = require("./routers/token")

// routers
app.use('/task',taskRouter)
app.use('/token',deviceTokenRouter)


cron.schedule('*/1 * * * *', async() => {

    const resultObject = await task.find()
    const now = new Date()
    const nowTime = now.getTime()

    const dueTaskArray = resultObject?.filter(task => {

        const due = new Date(task?.due);
        const dueTime = due.getTime()

        const thirty_minute = 1800000
        // if Due is passed
        if((dueTime < nowTime) && task?.status==='pending'){
         return task
        }
        // due in 30 minutes or less
        if((dueTime - nowTime <= thirty_minute) && task?.status==='pending' ){
         return task 
        }
    })

    const emails_to_be_notified = dueTaskArray.map(task => task?.user?.email)

    const query = {
        user_email : {
           $in : emails_to_be_notified
        } 
    }

    const tokenResult = await deviceTokens.find(query)


    dueTaskArray.forEach( task => {

        const tokens = tokenResult.filter(token => token?.user_email === task?.user?.email)


          tokens.forEach(token => {
            const message = {
                notification: {
                    title: task?.title,
                    body: task?.description
                },
                token: token?.deviceTokenId
            };

            console.log(message)

            getMessaging().send(message)
             .then((response) => {
                 // Response is a message ID string.
                 console.log('Successfully sent message:', response);
             })
             .catch((error) => {
                 console.log('Error sending message:', error);
             });
          })

 })
    

  console.log(dueTaskArray);
  console.log("hi this runs every 1 minute")
});
