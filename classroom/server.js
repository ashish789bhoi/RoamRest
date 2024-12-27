const express = require('express');
const app = express();
const path=require('path');
const session = require('express-session');
const flash = require('connect-flash');

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


app.use(session({
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized:true,
}))

app.use(flash());

app.get('/flash', function(req, res){
    // Set a flash message by passing the key, followed by the value, to req.flash().
    req.flash('info', 'Flash is back!')
    res.send("OK");
  });

  app.get('/', function(req, res){
    // Get an array of flash messages by passing the key to req.flash()
    res.send(req.flash('info'));
  });


// app.get("/test",(req,res)=>{
//     res.send("Test Successful");
// })

// app.get("/reqCount",(req,res)=>{
//     if (req.session.no_of_count) {
//         req.session.no_of_count++;
//     }
//     else{
//         req.session.no_of_count=1;
//     }
//     let count=req.session.no_of_count;
//     res.send(`You sent a request ${count} times`);
// })



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});