require('dotenv').config();
// console.log(process.env.JI);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const {listingsSchema} = require("./schema.js");   //Currently not used

const listingRouter = require("./routes/listing.js");    //Listings routes
const reviewRouter=require("./routes/reviews.js");       //Reviews routes
const userRouter=require("./routes/user.js");           //Users routes

const session= require("express-session");
const flash=require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");       

app.set("view engine","ejs");   //Setting view engine
app.set("views",path.join(__dirname,"views"));   //Setting views path
app.engine('ejs', ejsMate);   // use ejs-locals for all ejs templates:
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
//Creating session
app.use(session({
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires:Date.now() + 1*24*60*60*1000,  // for coolie expire time. 
        maxAge: 7*24*60*60*1000,  //for max age of cookie
    }
}))
app.use(flash());     //Always use after session middleware
//Authentication middlwares
app.use(passport.initialize());  
app.use(passport.session());   // For persistent login sessions

passport.use(new LocalStrategy(User.authenticate()));   //Giving model to passport for authentication
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {    //added the req, to use it anywhere
    res.locals.req = req;
    next();
});


//Setting mongo URL
const MONGO_URL = process.env.MONGO_URL;

async function main() {       //function to connect MonoDB
    await mongoose.connect(MONGO_URL);
  }

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log("Can't connect to DB");
    console.log(err);
})

const PORT = 8080;
if (process.env.VERCEL_ENV) {
    // Export the app for Vercel
    module.exports = app;
  } else {
    // Start the server locally
    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  }

main().catch(err => console.log(err));


//Root route
app.get("/",(req,res)=>{
    res.send("Hi! I,m root");
})

//Passing listed matching routes to their respective file
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// Handle page not found
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

// Error handling middleware and page
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || "Something Went Wrong";
    res.status(status);
    res.render("listings/error.ejs",{err});
});