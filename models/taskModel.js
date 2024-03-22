const mongoose = require('mongoose');

const {Schema,SchemaTypes} = mongoose;

const {String,ObjectId,Date,} = SchemaTypes

const userSchema = new Schema({
    user:{
        userName : {
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true  
        }
    },
    title:{type:String, required:true},
    description:{type:String, required:true},
    status:{type:String , required:true},
    due:{type:Date , required:true}
}
,
{
    timestamps:true
}
)

const user = mongoose.model('task',  userSchema);
module.exports = user;