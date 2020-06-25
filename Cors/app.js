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
mongoose.connect('mongodb://localhost/HypayDb', {
	
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex:true

});



// FUNCTION TO DISPALY THE ENTIRE DB
function displayUsers(){

	User.find({},function(err,res){
		if(err){
			console.log("Cannot display all user data");
		}else{
			console.log(res);
		}
	});

}

// FUNCTION TO ADD A NEW USER
function addUser(formResult){

	User.create(formResult,function(err,res){
		if(err){
			console.log("messed up");
		}else{
			console.log("added successfully");
			displayUsers();
		}
	});	

}

// SETTING UP THE VIEW ENGINE
app.set("view engine","ejs");

// ************
// LOGIN ROUTES
// ************

app.get("/",function(req,res){
	//CALLING THE LOGIN PAGE
	res.render("login",{check:check});
	check = false;
});


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/'}),
  function(req, res) {
    res.render("logged");
  });

// FUNCTION TO CHECK LOG-IN STATUS

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/");
}

app.get("/logged",isLoggedIn,function(req,res){
	res.render("logged");
});

// ************
// SIGNUP ROUTES
// ************

app.get("/signup",function(req,res){
	//CALLING THE SIGNUP PAGE
	res.render("signup",{exists:false});
	exists = false;
});


app.post("/register",function(req,res){
	User.register(new User({uname:req.body.uname,username:req.body.username}),req.body.upass,function(err,user){
		if(err){
			if(err.name === "UserExistsError"){
				res.render("signup",{exists:true});
			}else{
				res.send("could not be added to the db");
			}
		}else{
			res.render("logged");
		}
		
	});	
});

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
