//config Start
const express = require ("express");
const cors = require ("cors");
const mongo = require ("mongoose");
const dontev = require('dotenv').config();

const Person = require ('./models/person');

console.log(dontev.parsed);

const app = express();
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

const JWT_SECRET =
  "nasdmmdjrgtogpd12231177582394<dd>dffru(sdjjkk)vneeNSHDMEMHS";

const userDB = process.env.DB_USER;
const passwordDB = encodeURIComponent(process.env.DB_PASSWORD);

mongo
  .connect( 
    `mongodb+srv://${userDB}:${passwordDB}@apicluster.k3k5vkt.mongodb.net/players?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to database");
    return json({message:"conected"});
  })
  .catch((e) => console.log(e));

const port = process.env.PORT || 8080;

//Forma de ler o Json
app.use(
    express.urlencoded({
        extended: true,
    }),
)

const users = [];

app.get("/", (req, res) => {
  res.json({message: "Hello word " + process.env.DB_USER});
});

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
})

app.get("/users", async (req, res) => {
  const allUser = await Person.find({}, {_id:0, email:0, 
    password:0, __v:0}).sort({score:-1}); //os campos que estão com os Zeros não aparecerão
  try {
    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
  }
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;

  const newUser = {
    id: Math.random().toString(36),
    name,
    email,
  };
  users.push(newUser);
  return res.json(newUser);
});

app.post("/users", (req, res) => {

})

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  const index = users.findIndex((user) => user.id === id);

  if (index < 0) {
    return res.status(404).json({ error });
  }

  users.splice(index, 1);
  return res.status(204).json();
});

app.listen(port, () => console.log(`listening on ${port}`));


