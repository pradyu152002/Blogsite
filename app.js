const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/blogUserDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const blogUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  blogs:Array
});

const User = mongoose.model("User", blogUserSchema);


// const blogSchema = new mongoose.Schema({
//   user: blogUserSchema,
//   blog :Array
// });
//
// const Blog = mongoose.model("Blog",blogSchema);



app.get("/", function(req, res) {
  res.render('home');
});

app.get("/login", function(req, res) {
  res.render('login');
});

app.get("/register", function(req, res) {
  res.render('register');
});

app.get("/admin",function(req,res){
  User.find({},function(err,users){
     res.render("adminPage",{usersName:"Admin",users:users});
  });
});

app.post("/view",function(req,res){
  const requestName = req.body.name;
  User.findOne({name:requestName},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        User.find({},function(err,users){
           res.render("adminView",{usersName:foundUser.name,users:users});
        });
      }
    }
  });
});


app.post("/deleteBlog",function(req,res){
  const requestName = req.body.name;
  User.findOne({name:requestName},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        foundUser.blogs=[];
        foundUser.save();
        res.render("deleteuser");
      }
    }
  })
});


app.post("/deleteUser",function(req,res){
  const requestName = req.body.name;
  User.findOne({name:requestName},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        User.deleteOne({name:foundUser.name},function(err){
          if(err){
            console.log(err);
          }else{

            res.render("deleteUser");
          }
        })
      }

    }
  })
});


app.post("/register", function(req, res) {
  const userName = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const newUser = new User({
    name: userName,
    email: email,
    password: password,
    blogs: []
  });
  // const newBlog = new Blog({
  //   user:newUser,
  //   blog:[]
  // });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
        // res.render("userPage",{usersName:newUser.name});
        // res.render("userPage",{usersName:foundUser.name,users:users});
        User.find({},function(err,users){
           res.render("userPage",{usersName:newUser.name,users:users});
        });
    }
  })

});


app.post("/login", function(req, res) {
  const requestedEmail = req.body.email;
  const requestedPassword = req.body.password;
  User.findOne({
    email: requestedEmail
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === requestedPassword) {
          if(foundUser.name==="admin"){
            User.find({},function(err,users){
               res.render("adminPage",{usersName:foundUser.name,users:users});
            });
          }else{
            User.find({},function(err,users){
               res.render("userPage",{usersName:foundUser.name,users:users});
            });
          }
          // res.render("userPage",{usersName:foundUser.name});
          // res.render("userPage",{usersName:foundUser.name,users:users});

        }
      }

    }
  });

});


app.post("/userPage",function(req,res){

  const composerName = req.body.name;
  User.findOne({name:composerName},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        var newBlog = [{title:req.body.postTitle ,post:req.body.postBody }];
        var oldList = foundUser.blogs;
        // console.log(oldList);
        oldList = oldList.concat(newBlog);
          console.log(oldList);
        // // var newList = foundUser.blogs.push(newBlog);
         // User.updateOne({name:foundUser.name},{blogs:oldList});
        foundUser.blogs = oldList;
        foundUser.save();
        // User.find({},function(err,users){
        //    res.render("userPage",{usersName:foundUser.name,users:users});
        // });
        res.redirect("/login")

      }
    }
  });
});


app.listen(3000, function() {
  console.log("Server running on port 3000");
});
