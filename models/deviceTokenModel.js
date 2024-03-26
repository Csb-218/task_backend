const mongoose = require('mongoose');

const {Schema,SchemaTypes} = mongoose;

const {String,Array} = SchemaTypes ;

const deviceTokenSchema = new Schema({
    user_email:{type : String , required:true},
    deviceTokenId:{type:String , required:true},
})

const device = mongoose.model('deviceTokens',deviceTokenSchema);
module.exports = device ;