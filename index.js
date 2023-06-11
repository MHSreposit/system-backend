//config Start
const express = require ("express");
const cors = require ("cors");
const mongo = require ("mongoose");
const dontev = require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const app = express();
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

var nodemailer = require("nodemailer");

const jwt_secret = process.env.JWT_SECRET;

const userDB = process.env.DB_USER;
const passwordDB = encodeURIComponent(process.env.DB_PASSWORD);

mongo
  .connect( 
    `mongodb+srv://${userDB}:${passwordDB}@apicluster.k3k5vkt.mongodb.net/players?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

const port = process.env.PORT || 7070;

//console.log(dontev.parsed); //ALERTA: Não fazer deploy com essa function

const Person = require ('./models/person');
require("./userDetails");
const User = mongo.model("UserInfo");


//Forma de ler o Json
app.use(
    express.urlencoded({
        extended: true,
    }),
)

const users = [];

//INDEX
app.get("/", (req, res) => {
  res.json({message: "Hello word"});
});

//Este grupo cria uma segunda tabela PESSOA(People) não está sendo usado 
//para nenhuma ação/ serve como extra para uma posterior ideia 
app.post('/person', async (req, res) =>{
    const {email} = req.body;

    const person = {
        email
    }
    try{
        await Person.create(person);
        res.status(201).json({message:'Player register sucess!'});
    } catch(error){
        res.json(500).json({error: error});
    }
});

//GET ALL USERS
app.get("/users", async (req, res) => {
  const allUser = await User.find({}, {_id:0, email:0, 
    password:0, __v:0}).sort({score:-1}); //os campos que estão com os Zeros não aparecerão
  try {
    res.send({data: allUser});
  } catch (error) {
    console.log(error);
  }
});

//REGISTER
app.post("/register", async (req, res) => {
    const { fname, lname, email, password, userType } = req.body;
  
    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.json({ error: "User Exists" });
      }
      await User.create({
        fname,
        lname,
        email,
        score:0,
        password: encryptedPassword,
        userType,
      });
      res.send({ status: "ok", message: " Cadastrado com sucesso!"});
    } catch (error) {
      res.send({ status: "error" });
    }
  });
//LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, jwt_secret, {
        expiresIn: "15m",
      });
  
      if (res.status(201)) {
        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "InvAlid Password" });
  });

//GET INFO USER ONE
app.post("/user", async (req, res) => {
    const {email} = req.body;
    const getUser = await User.findOne({email: email}, {password:0, __v:0, email:0});
  
    if (!getUser){
      return res.json({ status: "User Not Exists!!"});
    }
    try {
      res.send({data: getUser});
    } catch (error) {
      console.log(error);
    }
  });

//ADD SCORE
app.post("/addscore", async (req, res) => {
    const {id, score} =req.body;
    try {
      const addScore = await User.updateOne({_id: id}, {score: score});
      res.send({ status: "ok/ Score Adicionado!", data: addScore });
    } catch (error) {
      console.log(error);
    }
  });


//DELETE USER
app.post("/deleteuser", async (req, res) => {
    const { userid } = req.body;
    try {
      await User.deleteOne({ _id: userid });
      res.send({ status: "Ok", data: "Deleted" });
    } catch (error) {
      console.log(error);
    }
  });

//Autenticação e permissão de acesso de Dados
app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, jwt_secret, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      User.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) { }
  });

app.listen(port, () => console.log(`listening on ${port}`));


