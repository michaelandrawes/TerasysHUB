//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

var flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const localStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');

const app=express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

//handle session
app.use(session({
  secret:"gabod2000",
  resave:false,
  saveUninitialized:false
}));
app.use(flash());
//passport
app.use(passport.initialize());
app.use(passport.session());

//Database
mongoose.connect("mongodb+srv://admin-michael:12345@cluster0-hddv9.mongodb.net/terasysDB",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
  username:{type:String,index:true},
  email:String,
  password:String,
  numbers:String
});
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userSchema);
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//validator
app.use(expressValidator({
  errorFormatter: function(param,msg,value){
  var namespace=param.split('.'),
  root=namespace.shift(),
  formParam=root;

while (namespace.length) {
  formParam +='['+namespace.shift()+']';
}
return{
  param:formParam,
  msg:msg,
  value:value
};
  }
}));

//messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*',function(req,res,next){
  res.locals.user=req.user||null;

  next();
});


app.get("/",function(req,res){
// if (req.isAuthenticated()) {

    res.render("home",{titlemsg:"Home"});

  //}else {
    //res.redirect("/login");
    //}
});

app.get("/netop",function(req,res){
 if (req.isAuthenticated()) {
    res.render("netop",{titlemsg:"Netop PoC Board"});
 }else {
    res.redirect("/login");
   }
});

app.get("/Slovenia",function(req,res){
 if (req.isAuthenticated()) {
    res.render("Slovenia",{titlemsg:"Slovenia"});
 }else {
    res.redirect("/login");
   }
});

app.get("/office",function(req,res){
 if (req.isAuthenticated()) {
    res.render("office",{titlemsg:"office board"});
 }else {
    res.redirect("/login");
   }
});

app.get("/OfficeBoard",function(req,res){
 if (req.isAuthenticated()) {
    res.render("OfficeBoard",{titlemsg:"Office Board"});
 }else {
    res.redirect("/login");
   }
});

app.get("/newly",function(req,res){
 if (req.isAuthenticated()) {
    res.render("newly",{titlemsg:"Newly created device"});
 }else {
    res.redirect("/login");
   }
});

app.get("/newlyCreated",function(req,res){
 if (req.isAuthenticated()) {
    res.render("newlyCreated",{titlemsg:"Newly created device"});
 }else {
    res.redirect("/login");
   }
});


app.get("/Tobi",function(req,res){
 if (req.isAuthenticated()) {
    res.render("Tobi",{titlemsg:"Tobi's Board"});
 }else {
    res.redirect("/login");
   }
});

app.get("/updated",function(req,res){
 if (req.isAuthenticated()) {
    res.render("updated",{titlemsg:"Updated"});
 }else {
    res.redirect("/login");
   }
});

app.get("/OfficeNew",function(req,res){
 if (req.isAuthenticated()) {
    res.render("OfficeNew",{titlemsg:"Office New"});
 }else {
    res.redirect("/login");
   }
});

app.get("/register",function(req,res){
  res.render("register",{titlemsg:"Register",errormsgs:{}});
});
app.post("/register",function(req,res){
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;
  const confirmPassword=req.body.confirmpassword;

//form validator
    req.checkBody('username','username field is required').notEmpty();
    req.checkBody('email','email field is required').notEmpty();
    req.checkBody('email','email field is not valid').isEmail();
    req.checkBody('password','password field is required').notEmpty();
    req.checkBody('confirmpassword','password is not match').equals(req.body.password);

const errors=req.validationErrors();

if (errors) {
  res.render("register",{errormsgs:errors,titlemsg:"Register"});
} else {
  User.register({username:req.body.username,email:req.body.email},password,function(err,user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    }else {
      passport.authenticate("local")(req,res,function(){

            res.redirect("/");

          });
    }
  });
    req.flash('success','You Are Now Registered and You Can login');
  }
  });

app.get("/login",function(req,res){
  res.render("login",{titlemsg:"Login "});
});

app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){
    if (err) {
      res.redirect('/login');
    }else {
      passport.authenticate("local",{failureRedirect:'/login' })(req,res,function(){

        req.flash('success','You Are now logged in ,'+'Welcome  ' + req.body.username);
      res.redirect("/");
      });
      req.flash('failure','invalid username or password');
      req.flash('failure','unAuthorized');
    }
  });
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/logout",function(req,res){
req.logout();
req.flash('success','You are logged out');
res.redirect("/login");
});

app.listen(process.env.PORT||3000,function(){
  console.log("server runs on port 3000");
});
