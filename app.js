const express = require('express');
const app = express();
var formidable = require('formidable');
var fs = require('fs');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const session = require('express-session');

const bodyParser = require('body-parser');

const sqlite = require("aa-sqlite");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/views/'));

const sessions = require('express-session');
const cookieParser = require("cookie-parser");

app.use(cookieParser());

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24 * 30;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));



app.get("/",function(req,res){
    res.render("index.ejs", {"username":"ziyaretci"});
});

app.get("/login",function(req,res){
    res.render("login.ejs", {"data":""});
});

app.get("/register",function(req,res){
    res.render("register.ejs", {"data":""});
});


app.post("/register",async function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    await sqlite.open("Database.db");

    sql = "SELECT * FROM Users WHERE username = ?"
    query = await sqlite.get(sql, [username])
    
    if (query == undefined){
        sql = "INSERT INTO Users (username, password) VALUES (?,?)"
        await sqlite.push(sql, [username, password])
        sqlite.close();

        req.session.username = username;
        
        res.render("index.ejs",{"username": username});
    } else {
        sqlite.close()

        res.render("register.ejs", {"data":"Böyle bir kullanıcı mevcut."});        
    }

});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    await sqlite.open("Database.db");

    sql = "SELECT * FROM Users WHERE username = ?"
    query = await sqlite.get(sql, [username]);
    sqlite.close();

    if (query != undefined) {
        req.session.username = username;
        res.render("index.ejs", {"username": username});
    } else {
        res.render("login.ejs", {"data":"Girdiğiniz bilgiler yanlış."});
    }
    
});

app.post("/havuzaEkle", async function(req,res){
    const username = req.body.username;
    const kelime = req.body.kelime;
    const anlam = req.body.anlam;
    await sqlite.open("Database.db");
    sql = "INSERT INTO Havuzlar (username, kelime, anlam) VALUES (?,?,?)";
    try {
        await sqlite.push(sql, [username, kelime, anlam]);
    } catch (error){
        console.log(error);
    }
    sqlite.close();
    res.send("");
});

app.post("/havuzdanGetir", async function(req,res) {
    const username = req.body.username;
    await sqlite.open("Database.db");
    sql = "SELECT kelime,anlam FROM Havuzlar WHERE username=?";
    try {
        kelimeler = await sqlite.get_all(sql, [username]);

    } catch (error){
        console.log(error);
    }
    kelimeler = kelimeler["data"];
    var len = kelimeler.length;
    sqlite.close();
    var data = kelimeler[Math.floor(Math.random()*len)];

    res.send(data);
});



app.get("/logout", function(req,res) {
    res.render("login.ejs" ,{"data":""});
});




var server = app.listen(process.env.PORT || 3000, "0.0.0.0");
console.log("Connected");



