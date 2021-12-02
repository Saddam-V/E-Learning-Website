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
const Jimp = require('jimp') ;
const download = require('download');
const nodemailer = require("nodemailer");
const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { resolve } = require("path");

global.nam="somevalue";
global.nm="somevalue";
global.namfac="somevalue";
global.crs="somevalue";
global.y="somevalue";
global.yfac="somevalue";
global.yadmin="somevalue";
global.i=0;
global.s=0;
global.f=0;
global.ad=0;
global.supad=0;


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
    crsnew=crs.replace(/\s/g, "");
    cb(null, crsnew+".png");
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
app.use(bodyparser.text({ type: "text/plain" })); 

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
const LoginSchemasupadmin = new mongoose.Schema({
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
  courseprice : String
});

const LoginSchemauser = new mongoose.Schema({
  studentid: String,
  studentcourses: String,
  courseid: String,
  studentcertificate: String
});

const LoginSchemacertificate = new mongoose.Schema({
  coursename: String,
  studentid: String
});

const user = mongoose.model('user', LoginSchema);
const faculty = mongoose.model('faculty', LoginSchemafaculty);
const course = mongoose.model('courses', LoginSchemacourses);
const usrdtl = mongoose.model('usrdtl', LoginSchemauser);
const admin = mongoose.model('admin', LoginSchemaadmin);
const supadmin = mongoose.model('supadmin', LoginSchemasupadmin);
const certi = mongoose.model('certi', LoginSchemacertificate);

async function textOverlay(x,y) {
  user.find({username:x},async function(err,docs){
    if(docs[0]==undefined){
      console.log(err);
    }
    else{
      z=docs[0].name;
      console.log("thispoint")
      console.log(z);
   // Reading image
   const image = await Jimp.read('./static/courseimages/certificate.jpg');
   // Defining the t ext font
   const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
   image.print(font,117, 97, z);
   image.print(font,55,157, y);
   // Writing image after processing
   await image.writeAsync('./static/certificates/'+x+y+'.jpg');
  }
  });
}

console.log("Image is processed succesfully");


// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')); // For serving static files
app.use(express.urlencoded());

// PUG SPECIFIC STUFF
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory

// ENDPOINTS
app.post('/contactus',(req,res)=>{
  var dtl=req.body;
  var name=dtl.yourname;
  var mail=dtl.mail;

//********************************************************************************************** */
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'m2learning0@gmail.com',
    pass:'qmwnebrv102938'
  }
});

var mailOptions = {
  from: 'm2learning0@gmail.com',
  to: 'mohammedshafin055@gmail.com',
  subject: 'Test mail from M2Learning',
  text: `A person with name  `+name+` and email `+mail+` wants to contact you`
};

transporter.sendMail(mailOptions, function(error, info){
  if(error){
    console.log(error);
  }else{
    console.log('Email sent: ' + info.response);
  }
});

res.status(200).render("email.pug")

})
app.post('/buycourse',(req,res)=>{
  user.find({username:nam},function(err,docs){
  var stuphone = docs[0].phone
  console.log("this");
  console.log(req.body.crsname); 
  course.find({coursename:req.body.crsname},function(err,docs){
      const fac=docs[0].facultyid;


    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:'m2learning0@gmail.com',
        pass:'qmwnebrv102938'
      }
    });

    var mailOptions = {
      from: 'm2learning0@gmail.com',
      to: fac,
      subject: 'Test mail from M2Learning',
      text: `A student with mailid `+y+` and phone number `+stuphone+` wants to buy your course `+req.body.crsname
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error);
      }else{
        console.log('Email sent: ' + info.response);
      }
    });



  });
      res.status(200).render("email.pug");
});
});
    //********************************************* Faculty Dashboard functions ************************************************* */
app.post('/assigncertificate',(req,res,next)=>{
  const usrobj = req.body;
  console.log(usrobj.usrnm);
  console.log(usrobj.course);

  course.find({coursename: usrobj.course},function(err,docs){
    try{
    if(err){
      console.log(err)
    }
    else{
      if(docs[0].facultyid==yfac){
        Certi = new certi({coursename: usrobj.course,
        studentid: usrobj.usrnm})
        }
        Certi.save();

        textOverlay(usrobj.usrnm,usrobj.course);

      }
      res.status(200).render('faculty.pug');
    }catch{
      res.render("unexpected.pug");
    }
    });
});
app.post('/uploadcourse',(req,res,next)=>{
  // y=fs.readFileSync('usrnmfac.txt');
  const usrobj = req.body
  let output = {'name': `${yfac}`}

  console.log(usrobj.cat)

  Course = new course({ facultyid: yfac,
    coursename: usrobj.coursename,
    courseprice: usrobj.courseprice,
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
    const usrobj = req.body
    let output = {'name': `${y}`}
    course.find({coursename: usrobj.coursename,facultyid: y}, function(err,docs){
      console.log(usrobj.usrnm)
      if(usrobj.option=="student"){
             usrdtl.find({studentid: usrobj.usrnm},function(err, users) {
               function getKeyByValue(object, value) {
                 return Object.keys(object).find(key => object[key] === value);
               }

                 var x = users[0].courseid;
                 userMapstring = users[0].studentcourses;
                 courseMapstring = users[0].courseid;
                 userMap = JSON.parse(userMapstring);
                 courseMap = JSON.parse(courseMapstring);
                 var key=getKeyByValue(userMap,usrobj.coursename);
                 console.log(x);
                 userMap[key] = " ";
                 courseMap[key] = " ";
                 userstring=JSON.stringify(userMap);
                 coursestring=JSON.stringify(courseMap);
                 console.log(userMap,courseMap);

                 usrdtl.updateOne({ studentid: usrobj.usrnm}, 
                   {studentcourses:userstring,
                    courseid: coursestring}, function (err, docs) {
                   if (err){
                       console.log(err)
                   }
                   else{
                       console.log("Updated Docs : ", docs);

                   }
                 });
             })
            }
            else if(usrobj.option=="database"){
                course.deleteOne({ coursename: usrobj.coursename,
                  facultyid: yfac }, function (err) {
                  if (err) return handleError(err);
                  console.log("Error")
                });
            }
           })
  
    res.status(200).render('faculty.pug',output);
  
    });

  app.post('/assigncourse',(req,res,next)=>{
    const usrobj = req.body;
    let output = {'name': `${yfac}`}
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
      try{
      if(err){
        console.log(err)
      }
      else{
        if(docs[0].facultyid==yfac){
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
                  //*************************************************** TO SEND MAIL ******************************************* */
                  var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user:'m2learning0@gmail.com',
                      pass:'qmwnebrv102938'
                    }
                  });
                
                  var mailOptions = {
                    from: 'm2learning0@gmail.com',
                    to: usrobj.studentid,
                    subject: 'Course Assigned Successfully',
                    text: `Congratulations, the course is successfully assigned to you. Name of course is ` +usrobj.coursename
                  };
                
                  transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                      console.log(error);
                    }else{
                      console.log('Email sent: ' + info.response);
                    }
                  });
                
              //********************************************************************************************** */

                  
              }
            });
          });
        }
        else{
          console.log("course does not belong to you");
        }
        res.status(200).render('faculty.pug');
      }
    }catch(err){
      res.status(404).render('unexpected.pug');
    }
    });  
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
//**************************************************************************************************************** */
    //*******************************************  End users sign in functions  *************************************************** */
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



app.post('/signin', async (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  user.find({ username: usrobj.objusrnm},function (err, docs) {
      var x=docs;
      if(docs[0]==undefined){
        // res.render('homelogin.pug');
        console.log("this is undefined");
      }
      else{
        var usrnm = docs[0].username;
        // fs.writeFileSync("usrnm.txt", usrnm);
        y=usrnm;
        na=docs[0].name; 
        nm = na.split(" ")[0]
        nam=docs[0].username; 

      
    // res.render("midpage.pug");
      }

    });
  });
 
  

app.post('/signinfaculty', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  faculty.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      // res.render('home.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      yfac=usrnm;
      // fs.writeFileSync("usrnmfac.txt", usrnm);
      nm=usrobj.objname;
      nam=docs[0].username;  
    }
  });
// else{
//   res.render("home.pug");
// }
});

app.post('/signinadmin', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  admin.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      // res.render('admin.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      yadmin=usrnm;
      // fs.writeFileSync("usrnmadmin.txt", usrnm);
      nm=usrobj.objname;
      nam=docs[0].username;  
    }
  });
});

app.post('/signinsupadmin', (req, res)=>{
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  supadmin.find({ username: usrobj.objusrnm}, function (err, docs) {
    var x=docs;
    if(docs[0]==undefined){
      // res.render('admin.pug');
      console.log(docs);
    }
    else{
      var usrnm = docs[0].username;
      yadmin=usrnm;
      // fs.writeFileSync("usrnmadmin.txt", usrnm);
      nm=usrobj.objname;
      nam=docs[0].username;  
    }
  });
});
//******************************************  Get Requests **************************************************** */
app.get('/', (req, res)=>{
  y="somevalue";
  yfac="somevalue";
  yadmin="somevalue";
    // fs.writeFileSync("usrnm.txt", " ");
    res.status(200).render('home.pug');
});
//************PAGE TO CHOOSE YOUR ROLE **************** */
app.get('/choose',(req,res)=>{
  var temp1;
  var temp2;
  var temp3;
  var temp4;
  var x=1;
  let p=new Promise((resolve, reject)=>{
  user.find({ username: nam}, function (err, docs) {
    console.log("this choose");
    console.log(docs);
    console.log(docs[0]);
    if(docs[0]==undefined){
      s=0;
    }else{
      s=1;
    }
    console.log(s);
    temp1=1;
  });
  faculty.find({username: nam},function(err,docs){
    console.log(nam);
    console.log(docs);
    console.log(docs[0]);
    if(docs[0]==undefined){
      f=0;
    }else{
      f=1;
    }
    console.log(f);
    temp2=1;
  });
  admin.find({username: nam},function(err,docs){
    if(docs[0]==undefined){
      ad=0;
    }else{
      ad=1;
    }
    console.log(ad);
    temp3=1;
  });
  supadmin.find({username: nam},function(err,docs){
    if(docs[0]==undefined){
      supad=0;
    }else{
      supad=1;
    }
    console.log(supad);
    temp4=1;
    if(temp1==1 && temp2==1 && temp3==1 && temp4==1){
      resolve('success');
      x=0;
  }
  });

  });

  p.then(()=>{
    if(f==0 && ad==0 && supad==0){
      res.status(200).render("homelogin.pug");
    }
    else{
      let output = {'student': `${s}`,'faculty':`${f}`,'admin':`${ad}`,'superadmin':`${supad}`}
        res.status(200).render("choose.pug",output);
    }
  }).catch(()=>{
     console.log("this is in catch");
  })
  // console.log(supad);
});

app.get('/midpage',(req,res)=>{
  res.status(200).render("midpage.pug")
});

//********************************************* Users Profile ************************************************* */
app.get('/profile', (req, res)=>{
   console.log("name iss")
   console.log(nam);
   user.find({ username: nam}, function (err, docs) {
    var x=docs;
    console.log(x)
    if(docs[0]==undefined){
      res.render('homelogin.pug');
      console.log("un");
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
    // y=fs.readFileSync('usrnm.txt');
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
        qual=docs[0].class; 
        pic=docs[0].profpic;

        console.log(nams);
        console.log(pic);
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

app.get('/mycerti',(req,res)=>{
  // y=fs.readFileSync('usrnm.txt');
  certi.find({studentid:y}, function(err, users) {

    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('mycerti.pug',{title:'Courses',products:userMap});

  });
});

app.get('/mystuff',(req,res)=>{
  // y=fs.readFileSync('usrnm.txt');
  usrdtl.find({studentid:y}, function(err, users) {
    userMapstring = users[0].studentcourses;
    courseMapstring = users[0].courseid;
    userMap = JSON.parse(userMapstring);
    courseMap = JSON.parse(courseMapstring);

    res.status(200).render('mystuff.pug',{title:'Courses',products:userMap,ids:courseMap});
  });
});

//********************************************************************************************** */
//********************************************* Categories Options ************************************************* */
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
//************************************************************************************************************* */
//***********************************************Faculty dashboard my courses*********************************************** */
app.get('/getcourse',(req,res)=>{
  course.find({facultyid:nam}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    console.log(userMap);  
    res.status(200).render('course.pug',{title:'Courses',products:userMap});
  });
});
    //********************************************************************************************** */

app.get('/categories', (req, res)=>{
  res.status(200).render('categories.pug');
})

app.get('/signin', (req, res)=>{
  y="somevalue";
  // fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signin.pug');
})

app.get('/signinfaculty', (req, res)=>{
  yfac="somevalue";
  // fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signinfaculty.pug');
})

app.get('/signupfaculty', (req, res)=>{
  yfac="somevalue";
  // fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signupfaculty.pug');
})

app.get('/faculty', (req, res)=>{
  if(f==1){
  res.status(200).render('faculty.pug');
  }
  else{
    res.status(200).render('home.pug');
  }
})

app.get('/admin', (req, res)=>{
  if(ad==1){
    res.status(200).render('admin.pug');
  }else{
    res.status(200).render('home.pug');
  }
});

app.get('/supadmin', (req, res)=>{
  if(supad==1){
    res.status(200).render('supadmin.pug');
  }else if(ad==1){
    res.status(200).render('admin.pug');
  }
  else{
    res.status(200).render('home.pug');
  }
});

app.get('/signupadmin', (req, res)=>{
  res.status(200).render('signupadmin.pug');
});

app.get('/signinadmin', (req, res)=>{
  res.status(200).render('signinadmin.pug');
})

app.get('/signup', (req, res)=>{
  y="somevalue";
  // fs.writeFileSync("usrnm.txt", " ");
  res.status(200).render('signup.pug');
})

app.get('/homelogin', (req, res)=>{
  res.status(200).render('homelogin.pug');
})

//*********************************************** Sign Up Options *********************************************** */
app.post('/signup', (req, res)=>{
  console.log("post is working")
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);
  console.log(usrobj.objopton)
  if(usrobj.objopton=="faculty"){
              console.log("inside faculty")
       
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user:'m2learning0@gmail.com',
                pass:'qmwnebrv102938'
              }
            });
          
            var mailOptions = {
              from: 'm2learning0@gmail.com',
              to: 'mohammedshafin055@gmail.com',
              subject: 'Request to be a faculty',
              text: `Someone wants to work on website as a faculty. Email id of person: `+usrobj.objusrnm
            };
          
            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error);
              }else{
                console.log('Email sent: ' + info.response);
              }
            });
          
   
  }
  
  
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
  nm=usrobj.objusrnm;
  y=usrobj.objusrnm;

  const details = user.find({ username: usrobj.objusrnm});
  console.log(details);
})

app.post('/signupfaculty', (req, res)=>{
  console.log("post is working")
  const usrdetail = req.body;
  const usrobj = JSON.parse(usrdetail);

    console.log("inside faculty")

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:'m2learning0@gmail.com',
      pass:'qmwnebrv102938'
    }
  });

  var mailOptions = {
    from: 'm2learning0@gmail.com',
    to: usrobj.objusrnm,
    subject: 'You are now a faculty',
    text: `You are now a faculty on M2Learning. Your Email id: `+usrobj.objusrnm
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
    }else{
      console.log('Email sent: ' + info.response);
    }
  });



  UsersName = new faculty({ name: usrobj.objname,
    username: usrobj.objusrnm,
    Email: usrobj.objemailid,
    phone : usrobj.objpn,
    subject : usrobj.objcls,
    profpic : "null"
    });
  nm=usrobj.objname;
  y=usrobj.objusrnm;
  // fs.writeFileSync("usrnmfac.txt", usrobj.objusrnm);
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
  yadmin= usrobj.objusrnm;
  // fs.writeFileSync("usrnmadmin.txt", usrobj.objusrnm);
  UsersName.save();
  const details = user.find({ username: usrobj.objusrnm});
  console.log(details);
});
//********************************************************************************************** */
//*********************************************** SEARCH BAR*********************************************** */
app.post('/search', (req, res)=>{
  const srchobj = req.body;
  console.log(srchobj.cname);
  course.find({ "coursename": { "$regex": srchobj.cname , "$options": "i" } }, function (err, docs){
    try{
      if(docs==undefined){
        res.render('notfound.pug');
      }
      else{
        var userMap = {};

        docs.forEach(function(user) {
          userMap[user._id] = user;
        });
      
        console.log(userMap);  
        res.status(200).render('course.pug',{title:'Courses',products:userMap});
      }
    }
    catch(err){
      res.render('notfound.pug');
    }
  })
});
app.get('/certi:id', function(req, res) {
  // y=fs.readFileSync('usrnm.txt');
  var id = req.params.id
  certi.find({_id:id}, function (err, docs) {

  var cname = docs[0].coursename;
  console.log(cname);
  res.download('./static/certificates/'+y+cname+'.jpg');
  });
  // res.status(200).render('profile.pug');
});

app.get('/:id', function(req, res) {
  var id = req.params.id
  course.find({ _id: id}, function (err, docs) {
    var x=docs;
    try{
    if(docs==undefined){
      res.render('notfound.pug');
    }
    else{
      qual = docs[0].coursename;
      nams=docs[0].coursedes;
      pic=docs[0].coursepic;
      price=docs[0].courseprice;

      let output = {'name': `${nams}`,'qual':`${qual}`,'profpic':`${pic}`,'price':`${price}`}
      console.log(output.qual);
      res.status(200).render('coursepage.pug',output);
    }
  }
  catch(err){
    res.render('notfound.pug');
  }
  });
});
// START THE SERVER
app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
});