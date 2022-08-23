const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const globalSchema = new Schema({
    phoneNumber:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
    },
    email:{
        type:String,

    },
    spamCount:{
        type:Number,
        default:0,
    },
    spam:{
        type:String,
        default: 'Not spam'
    }
});

module.exports = mongoose.model('globalDB',globalSchema);

