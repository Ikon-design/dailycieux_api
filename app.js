const express = require('express');
var cors = require('cors');
const app = express();
const mongodb = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'dailycieux';

app.use(express.json());
app.use(cors());

app.post('/api/user/create', async (req, res) => {
  const {firstname, lastname, companyName} = req.body;
  const points = 0;
  const totalPoints = 0;
  const teamId = 1;
  const role = 3;
  const result = await insertUser(firstname, lastname, companyName, points, totalPoints, teamId, role);

  res.send(result);
});

app.get('/api/user/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  const response = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
  console.log(response);
  res.send(response);
});

async function insertUser(firstname, lastname, companyName, points, totalPoints, teamId, role) {
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('users').insertOne({
    firstname: firstname,
    lastname: lastname,
    companyName: companyName,
    point: points,
    totalPoint: totalPoints,
    teamId: teamId,
    role: role
  });
  return result.insertedId;
}

app.post('/api/points/win', async (req, res) => {
  const { id, points } = req.body;
  console.log(id, points, req.body);
  if (id != undefined && points != undefined) {
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const getUser = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    const response = await client.db(dbName).collection('users').updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { points: parseInt(getUser.points) + parseInt(points), totalPoints: parseInt(getUser.points) + parseInt(points) } });
    res.send(response);
  }else {
    res.send("error");
  }
});

app.post('/api/points/loose', async (req, res) => {
  const { id, points } = req.body;
  if (id != undefined && points != undefined) {
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const getUser = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    const response = await client.db(dbName).collection('users').updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { points: parseInt(getUser.points + points), totalPoints: parseInt(getUser.points - points) } });
    res.send(response);
  }else {
    res.send("error");
  }
});


app.post('/api/teams/create', async (req, res) => {
  const {name} = req.body;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('teams').insertOne({
    name: name,
  });
  res.send(result);
});

app.post('/api/events/create', async (req, res) => {
  const {teamId, name, desciption, reward } = req.body;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('events').insertOne({
    teamId: new mongodb.ObjectId(teamId),
    name: name,
    desciption: desciption,
    reward: reward
  });
  res.send(result);
});

app.get('/api/events/getAllById/:id', async (req, res) => {
  const id = req.params.id;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  const response = await client.db(dbName).collection('events').find({ teamId: new mongodb.ObjectId(id) }).toArray();
  res.send(response);
});



module.exports = app;