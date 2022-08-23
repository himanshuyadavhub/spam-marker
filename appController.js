const mongoose = require('mongoose');
const profile = require('./models/profile');
const globalDB = require('./models/globaldb');
const constant = require('./constant.json')

const bcrypt = require("bcryptjs");

exports.register = async(req,res) => {
    var {name,phoneNumber,email,password} = req.body;
    var user = await profile.findOne({phoneNumber});

    if(user){
        req.session.error = 'Mobile Number already exist.';
        return res.redirect('/register');
    }

    var hashdpsw = await bcrypt.hash(password,12);

    user = new profile({
        name,
        phoneNumber,
        password:hashdpsw,
        email
    });

    var globalUser = new globalDB({
        name,
        phoneNumber,
        email,
    });

    await user.save();
    await globalUser.save();

    res.redirect('/login');
 
};

exports.login = async(req,res) => {
    var {phoneNumber,password} = req.body;
    var user = await profile.findOne({phoneNumber});

    if(!user){
        req.session.error = `Account doesn't exist`;
        return res.redirect('/login');
    }

    var isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        req.session.error = ' Incorrect password';
        return res.redirect('/login')
        
    }

    req.session.isAuth = true;
    req.session.phoneNumber = phoneNumber;
    res.send('logged in');
};

exports.spamMarking = async(req,res) => {
    var {phoneNumber,isSpam} = req.body;
    var user = await globalDB.find({phoneNumber});
    
    if(isSpam && user){
        var updated = await globalDB.updateMany({phoneNumber},{$inc:{spamCount:1}});
        await updated.save();

        if(user.spamCount >= constant.SPAM)
            var spamUpdated = await globalDB.updateMany({phoneNumber},{spam:'Spam'});
        
        if(user.spamCount >= constant.NOTSPAM && user.spamCount < constant.SPAM){
            var spamUpdated = await globalDB.updateMany({phoneNumber},{spam:'Likely spam'});

        }
        await spamUpdated.save();
        return res.send('Spam Marked');

    } else if(isSpam && !user){
        var user = new globalDB({
            phoneNumber,
            spamCount:1
        });

       await user.save();
       return res.send('Spam marked')
    }

    res.redirect('/dashboard');

};

exports.search = async(req,res) => {
    var name = req.query.name;
    var phoneNumber = req.query.phoneNumber;

    if(name){
        var user = await globalDB.find({name},{name:1,phoneNumber:1,spam:1,_id:0,spamCount:0});
    
        return res.send(user);

    };

    if(phoneNumber){
        var user = await profile.findOne({phoneNumber});

        if(!user){
            var user = await globalDB.find({phoneNumber});
        }

        return res.send(user);
    };
    
};
