// PACKAGES REQUIRED
var express               = require("express"),
    mongoose              = require("mongoose"),
    bodyparser            = require("body-parser"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user"); 

var app = express();
var check = false;

// TO ENABLE BODY PARSING
app.use(bodyparser.urlencoded({extented:true}));

app.use(require("express-session")({
	secret : "ThisIsNotMy Random_Salt",
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// TO INTIMATE EXPRESS TO LOOK IN THAT Dir()
app.use(express.static('public'));


// CONNECTING THE DATABASE TO THE SERVER
mongoose.connect('mongodb://localhost/CorsDb', {
	
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex:true

});

// SETTING UP THE VIEW ENGINE
app.set("view engine","ejs");

// ************
// LOGIN ROUTES
// ************

app.get("/",function(req,res){
	//CALLING THE LOGIN PAGE
	res.render("login",{check:false});
});

app.get("/err",function(req,res){
	//CALLING THE LOGIN PAGE
	res.render("login",{check:true});
});


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/err'}),
  function(req, res) {
	console.log(req.user);
	if(req.user.type == 'user' && req.body.usertype == 'user'){
		res.redirect("/home/u");
	}else if (req.user.type == 'doctor' && req.body.usertype == 'doctor'){
		res.redirect("/home/d");
	}else{
		check = true;
		res.redirect("/err");
	}

});

// FUNCTION TO CHECK LOG-IN STATUS

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/");
}

// ************
// SIGNUP ROUTES
// ************

app.get("/signup",function(req,res){
	//CALLING THE SIGNUP PAGE
	res.render("signup",{exists:false});
	exists = false;
});

app.post("/register",function(req,res){
		User.register(new User({uname:req.body.uname,username:req.body.username,type:req.body.usertype}),req.body.password,function(err,user){
			if(err){
				if(err.name === "UserExistsError"){
					res.render("signup",{exists:true});
				}else{
					res.send("could not be added to the db");
				}
			}else{
				passport.authenticate('local')(req,res,()=>{
					if(req.body.usertype == 'user'){
						res.redirect("/home/u");
					}else{
						res.redirect("/home/d");
					}
				})
				
			}
			
		});	
});

// *************
// HOME PAGE ROUTES
// *************

app.get("/home/d",isLoggedIn,(req,res)=>{
	res.render("dhome");
})


app.get("/home/u",isLoggedIn,(req,res)=>{
	res.render("phome");
})

// *************
// LOGOUT ROUTES
// *************

app.get("/logout",(req,res)=>{
	req.logout();
	res.redirect("/");
});

// LISTENING PORT
app.listen(3000,function(){
	console.log("HyPaY Server started");
});
