const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const connectDb = require('./db/db')
const appController = require('./appController');
const isAuth = require('./middleware/isAuth')

connectDb();

const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: "mySessions",
});

app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      store: store,
    })
);

app.use(express.urlencoded({ extended: true }));

app.get('/register',(req,res)=>{res.send('register GET')});
app.post('/register',appController.register);

app.get('/login',(req,res)=>{res.send('login GET')});
app.post('/login',appController.login);

app.post('/isSpam',isAuth,appController.spamMarking);

app.post('/search',isAuth,appController.search);


app.listen(5000,()=>{
    console.log('App is runnning on http://localhost:5000')
})