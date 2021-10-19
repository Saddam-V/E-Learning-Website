const express = require("express");
const request = require('request');
const path = require("path");
const fs = require("fs");
const { json } = require("express");
const app = express();
const port = 80;
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const multer = require('multer');

global.nam="somevalue";
global.nm="somevalue";
global.namfac="somevalue";
global.crs="somevalue";


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './static/userimages');
  },
  filename: function(req, file, cb) {
    cb(null, nm+".png");
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const storagecourse = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,'./static/courseimages');
  },
  filename: function(req, file, cb) {
    cb(null, crs+".png");
  }
});

const uploadcrs = multer({
  storage: storagecourse,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


app.use(bodyparser.urlencoded());

app.use(bodyparser.json());
app.use(bodyparser.text({ type: "text/plain" })); // use this instead

//Mongoose specific stuff
mongoose.connect('mongodb://localhost/UserSignup', {useNewUrlParser: true});

var db = mongoose.connection
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
  console.log("We are connected");
});


const LoginSchema = new mongoose.Schema({
  name: String,
  username: String,
  Email: String,
  phone : String,
  class : String,
  profpic : String
});
const LoginSchemafaculty = new mongoose.Schema({
  name: String,
  username: String,
  Email: String,
  phone : String,
  subject : String,
  profpic : String
});
const LoginSchemaadmin = new mongoose.Schema({
  name: String,
  username: String,
  Email: String,
  phone : String,
  subject : String,
  profpic : String
});
const LoginSchemacourses = new mongoose.Schema({
  facultyid: String,
  coursename: String,
  coursecat: String,
  coursedes: String,
  coursepic : String,
});

const LoginSchemauser = new mongoose.Schema({
  studentid: String,
  studentcourses: String,
  courseid: String,
  studentcertificate: String
});

const user = mongoose.model('user', LoginSchema);
const faculty = mongoose.model('faculty', LoginSchemafaculty);
const course = mongoose.model('courses', LoginSchemacourses);
const usrdtl = mongoose.model('usrdtl', LoginSchemauser);
const admin = mongoose.model('admin', LoginSchemaadmin);


// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')); // For serving static files
app.use(express.urlencoded());

// PUG SPECIFIC STUFF
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory

// ENDPOINTS

app.post('/uploadcourse',(req,res,next)=>{
  y=fs.readFileSync('usrnmfac.txt');
  const usrobj = req.body
  let output = {'name': `${y}`}

  console.log(usrobj.cat)

  Course = new course({ facultyid: y,
    coursename: usrobj.coursename,
    coursecat: usrobj.cat,
    coursedes: usrobj.coursedes,
    coursepic : "NULL"
    });

  Course.save();
  console.log(usrobj)
  crs=usrobj.coursename

  res.status(200).render('crsimg.pug',output);

  });

  app.post('/removecourse',(req,res,next)=>{
    y=fs.readFileSync('usrnmfac.txt');
    const usrobj = req.body
    let output = {'name': `${y}`}
  
    console.log(usrobj.cat)

    course.deleteOne({ coursename: usrobj.coursename,
      facultyid: y }, function (err) {
      if (err) return handleError(err);
      // deleted at most one tank document
      console.log("Error")
    });
  
    res.status(200).render('faculty.pug',output);
  
    });

  app.post('/assigncourse',(req,res,next)=>{
    y=fs.readFileSync('usrnmfac.txt');
    const usrobj = req.body
    let output = {'name': `${y}`}
    var userMapstring;
    var userMap;
    var userstring

    function ObjectLength( object ) {
      var length = 0;
      for( var key in object ) {
          if( object.hasOwnProperty(key) ) {
              ++length;
          }
      }
      return length;
    };
    course.find({coursename: usrobj.coursename},function(err,docs){
      if(err){
        console.log(err)
      }
      else{
        if(docs[0].facultyid==y){
          usrdtl.find({studentid: usrobj.studentid},function(err, users) {
            userMapstring = users[0].studentcourses;
            courseMapstring = users[0].courseid;
            userMap = JSON.parse(userMapstring);
            courseMap = JSON.parse(courseMapstring);
            var ln=(ObjectLength(userMap));
            userMap[ln]=usrobj.coursename;
            courseMap[ln]=docs[0]._id
            console.log("this one");
      
            console.log(userMap);
            console.log(courseMap);
        
            userstring=JSON.stringify(userMap);
            coursestring=JSON.stringify(courseMap);

            usrdtl.updateOne({ studentid: usrobj.studentid}, 
              {studentcourses:userstring,
               courseid: coursestring}, function (err, docs) {
              if (err){
                  console.log(err)
              }
              else{
                  console.log("Updated Docs : ", docs);
                  
              }
            });
          });
        }
        else{
          console.log("course does not belong to you");
        }
      }
    });
    res.status(200).render('faculty.pug');
  
    });

app.post('/uploadcourseimg',uploadcrs.single('filename1'),(req,res,next)=>{
  var crspic=req.file.path;
  y=fs.readFileSync('usrnmfac.txt');
  let output = {'profpic': `${crspic}`,'name': `${y}`}

  course.updateOne({coursename:crs}, 
    {coursepic:crspic}, function (err,docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated Docs : ",docs);
        res.status(200).render('faculty.pug');
    }
  });
})


app.post('/upload',upload.single('filename'),(req,res,next)=>{
  console.log(req.file.path);
  var pic=req.file.path;
  y=fs.readFileSync('usrnm.txt');
  let output = {'profpic': `${pic}`,'name': `${y}`}

  user.updateOne({username:y}, 
    {profpic:pic}, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated Docs : ", docs);
        let output = {'name': `${nams}`,'contact':`${contact}`,'email':`${email}`,'qual':`${qual}`,'profpic':`${pic}`}
        res.status(200).render('profile.pug',output);
    }
  });
    
  });



app.post('/signin', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  user.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      res.render('homelogin.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      fs.writeFileSync("usrnm.txt", usrnm);
      na=docs[0].name; 
      nm = na.split(" ")[0]
      console.log(na);
      nam=docs[0].username; 
    }
  });
})

app.post('/signinfaculty', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  faculty.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      res.render('faculty.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      fs.writeFileSync("usrnmfac.txt", usrnm);
      nm=usrobj.objname;
      namfac=docs[0].username;  
    }
  });
});

app.post('/signinadmin', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  admin.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      res.render('admin.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      fs.writeFileSync("usrnmadmin.txt", usrnm);
      nm=usrobj.objname;
      namfac=docs[0].username;  
    }
  });
});

app.get('/', (req, res)=>{
    fs.writeFileSync("usrnm.txt", " ");
    res.status(200).render('home.pug');
});

app.get('/profile', (req, res)=>{
   console.log("name iss")
   console.log(nam);
   user.find({ username: nam}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      res.render('homelogin.pug');
      console.log(docs);
    }
    else{
      usrnm = docs[0].usrnm;
      nams=docs[0].name;
      contact=docs[0].phone;
      email=docs[0].Email; 
      qual=docs[0].class 
      pic=docs[0].profpic;

      console.log(nam)
      let output = {'name': `${nams}`,'contact':`${contact}`,'email':`${email}`,'qual':`${qual}`,'profpic':`${pic}`}
      res.status(200).render('homelogin.pug',output);
    }
  });
});

app.get('/profilelogin', (req, res)=>{
    console.log(nam[0]);
    y=fs.readFileSync('usrnm.txt');
    user.find({ username: y}, function (err, docs) {
      var x=docs;
      if(docs[0]==undefined){
        res.render('homelogin.pug');
      }
      else{
        usrnm = docs[0].usrnm;
        nams=docs[0].name;
        contact=docs[0].phone;
        email=docs[0].Email; 
        qual=docs[0].class 
        pic=docs[0].profpic;

        let output = {'name': `${nams}`,'contact':`${contact}`,'email':`${email}`,'qual':`${qual}`,'profpic':`${pic}`}
        res.status(200).render('profile.pug',output);
      }
    });
})
app.post('/profile',(req,res)=>{
  usremail=req.body.usrnm;
  res.render('profile.pug');
})

app.get('/about', (req, res)=>{
  res.status(200).render('about.pug');
})

app.get('/course', (req, res)=>{
  course.find({}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
  
});

app.get('/mystuff',(req,res)=>{
  y=fs.readFileSync('usrnm.txt');
  usrdtl.find({studentid:y}, function(err, users) {
    userMapstring = users[0].studentcourses;
    courseMapstring = users[0].courseid;
    userMap = JSON.parse(userMapstring);
    courseMap = JSON.parse(courseMapstring);

    res.status(200).render('mystuff.pug',{title:'Courses',products:userMap,ids:courseMap});
  });
});

app.get('/computer',(req,res)=>{
  course.find({coursecat:'computer'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/electronics',(req,res)=>{
  course.find({coursecat:'electronics'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/language',(req,res)=>{
  course.find({coursecat:'language'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/mathematics',(req,res)=>{
  course.find({coursecat:'mathematics'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/science',(req,res)=>{
  course.find({coursecat:'science'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/other',(req,res)=>{
  course.find({coursecat:'other'}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
app.get('/categories', (req, res)=>{
  res.status(200).render('categories.pug');
})

app.get('/signin', (req, res)=>{
  fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signin.pug');
})

app.get('/signinfaculty', (req, res)=>{
  fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signinfaculty.pug');
})

app.get('/signupfaculty', (req, res)=>{
  fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signupfaculty.pug');
})

app.get('/faculty', (req, res)=>{
  res.status(200).render('faculty.pug');
})

app.get('/admin', (req, res)=>{
  res.status(200).render('admin.pug');
});

app.get('/signupadmin', (req, res)=>{
  res.status(200).render('signupadmin.pug');
});

app.get('/signinadmin', (req, res)=>{
  res.status(200).render('signinadmin.pug');
})

app.get('/signup', (req, res)=>{
  fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signup.pug');
})

app.get('/homelogin', (req, res)=>{
  res.status(200).render('homelogin.pug');
})

app.post('/signup', (req, res)=>{
  console.log("post is working")
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  
  UsersName = new user({ name: usrobj.objname,
    username: usrobj.objusrnm,
    Email: usrobj.objemailid,
    phone : usrobj.objpn,
    class : usrobj.objcls,
    profpic : "null"
    });
  UsersName.save();

    Usersdetails = new usrdtl({ studentid: usrobj.objusrnm,
      courseid: "{}",
      studentcourses: "{}",
      studentcertificate:"{}"
      });
      Usersdetails.save();


  fs.writeFileSync("usrnm.txt", usrobj.objusrnm);
  nm=usrobj.objname;

  const details = user.find({ username: usrobj.objusrnm});
  console.log(details);
})
app.post('/signupfaculty', (req, res)=>{
  console.log("post is working")
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  
  UsersName = new faculty({ name: usrobj.objname,
    username: usrobj.objusrnm,
    Email: usrobj.objemailid,
    phone : usrobj.objpn,
    subject : usrobj.objcls,
    profpic : "null"
    });
  nm=usrobj.objname;
  fs.writeFileSync("usrnmfac.txt", usrobj.objusrnm);
  UsersName.save();
  const details = user.find({ username: usrobj.objusrnm});
  console.log(details);
});

app.post('/signupadmin', (req, res)=>{
  console.log("post is working")
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  
  UsersName = new admin({ name: usrobj.objname,
    username: usrobj.objusrnm,
    Email: usrobj.objemailid,
    phone : usrobj.objpn,
    subject : usrobj.objcls,
    profpic : "null"
    });
  nm=usrobj.objname;
  fs.writeFileSync("usrnmadmin.txt", usrobj.objusrnm);
  UsersName.save();
  const details = user.find({ username: usrobj.objusrnm});
  console.log(details);
});


app.get('/:id', function(req, res) {
  var id = req.params.id
  course.find({ _id: id}, function (err, docs) {
    var x=docs;
    try{
    if(docs==undefined){
      res.render('homelogin.pug');
    }
    else{
      qual = docs[0].coursename;
      nams=docs[0].coursedes;
      pic=docs[0].coursepic;

      let output = {'name': `${nams}`,'qual':`${qual}`,'profpic':`${pic}`}
      res.status(200).render('coursepage.pug',output);
    }
  }
  catch(err){
    res.render('homelogin.pug');
  }
  });
});
// START THE SERVER
app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
});