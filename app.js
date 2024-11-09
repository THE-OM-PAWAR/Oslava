//============= Require Module are here ============//
require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const cookie = require("cookie");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs/dist/bcrypt");
const port = 8000;
const fs = require("fs");

const io = require("socket.io")(http, {
  cookie: true,
});

//============= middleware ============//
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());

// ============declearing module=========//
const { users } = require("./modules/schemas/User_Module");
const authentication_logout = require("./modules/authentication/authentication_logout");

//============= Static file  ============//
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

//============= Storage For Image ============//

// //============= Storage For Image ============//
// var storage_student = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/uploads/result_folder");
//     console.log(file);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + Math.floor(Math.random() * 1000) + file.originalname);
//     ``;
//   },
// });

app.get("/", (req, res) => {
  console.log("ompawar");
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/signUp", async (req, res) => {
  res.sendFile(__dirname + "/public/forms/signup.html");
});

app.post("/signUp", async (req, res) => {
  try {
    if (req.body.password == req.body.confirmPassword) {
      console.log(req.body);
        const user_info = await users.find({ userMobile: req.body.mobileNumber });
        // console.log(user_info[0])
        let exist = undefined;
        if (user_info[0] !== undefined) {
          if (user_info[0].userMobile == req.body.mobileNumber) {
            exist = true;
          }
          console.log(3);
        }
        if (exist == true) {
          res.status(400).send("this mobile exist so login please ");
          return;
        }
        if (exist == undefined) {
          var mydata = new users({
            userName: req.body.UserName,
            userMobile: req.body.mobileNumber,
            userEmail: req.body.email,
            userPassward: req.body.password,
            sign_up_date: Date(Date.now()),
          });
          const token = await mydata.generateAuthToken();
          // console.log(token);
          console.log("omp 196");

          res.cookie("jwt_user", token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 3),
            httpOnly: true,
            // secure:true
          });

          await mydata
            .save()
            .then((e) => {
              res.status(201).redirect("/");
            })
            .catch((error) => {
              res.status(400).send("not saveed 210" + error);
            });
        }
    } else {
      res.status(400).send("invalid details");
    }
  } catch (error) {
    res.status(400).send("not saveed 216" + error);
  }
});

app.get("/logIn", (req, res) => {
  res.sendFile(__dirname + "/public/forms/login.html");
});

app.post("/logIn", async (req, res) => {
  try {
    console.log(req.body)
    const usrename_mobile_no = parseInt(req.body.mobileNumber);
    const password = req.body.password;
    const user_info = await users.findOne({ userMobile: usrename_mobile_no });
    console.log(user_info)
    const isMatch = await bcrypt.compare(password, user_info.userPassward);
    console.log(241 + await bcrypt.compare(password , user_info.userPassward))

    if (isMatch) {
      const token = await user_info.generateAuthToken();

      res.cookie("jwt_user", token, {
        expires: new Date(Date.now() + 36000000),
        httpOnlysd: true,
        // secure:true
      });
      user_info.loginStatus = true;
      res.status(201).redirect("/");
    } else {
      res.send("passward not matching");
    }
  } catch (error) {
    // res.status(400).sendFile(__dirname + "/public/login.html");
    res.send(error);
  }
});


//============= logoutAll pages are here ============//

app.get("/logoutAll", authentication_logout, async (req, res) => {
    try {
      req.user.tokens = [];
  
      res.clearCookie("jwt_user");
      console.log("logout succesfully");
  
      await req.user.save();
      res.status(201).json({
        position: "modal6",
        method: "get",
        headers: {
          "content-type": "application/json",
        },
        body: {
          modal_html: `
              <div class="modal_wrapper no ">
                  <div class="modal_container">
                  <h2 class="modal_h2" >you have succesfully Logout</h2>
                      <p class="text">you have succesfully logout from all devices and your account data is securly saved. <br> login for getting your account and All Data</p>
                      <div class="action">
                          <a href="/" ><button class="btn_purple">Confirm</button></a>
                          </div>
                          </div>
              </div>`,
        },
      });
    } catch (error) {
      res.send(500).send(error);
    }
  });
  
//============= Server Listning here ============//
http.listen(port, "0.0.0.0", () => {
  console.log(`the app is runing at port http://localhost:${port}`);
});
