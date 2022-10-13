const express = require('express');
var cors = require('cors');
const app = express();
const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'dailycieux';

app.use(express.json());
app.use(cors());

async function insertUser(firstname, lastname, companyName, teamId, role, points, totalPoints) {
  if (teamId === null) { return 'Invalid value for teamId'; }
  if (role === null || role === NaN || typeof role != 'number') { return 'Invalid value for role'; }
  if (points === null || points === NaN || typeof points != 'number') { return 'Invalid value for points'; }
  if (totalPoints === null || totalPoints === NaN || typeof totalPoints != 'number') { return 'Invalid value for totalPoints'; }
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('users').insertOne({
    firstname: firstname,
    lastname: lastname,
    companyName: companyName,
    points: points,
    totalPoints: totalPoints,
    teamId: teamId,
    role: role
  });
  return result.insertedId;
}

app.post('/api/user/create', async (req, res) => {
  const {firstname, lastname, companyName} = req.body;
  if (firstname === null) { return res.send(JSON.stringify({ error: 'Invalid value for firstname' })); }
  if (lastname === null) { return res.send(JSON.stringify({ error: 'Invalid value for lastname' })); }
  if (companyName === null) { return res.send(JSON.stringify({ error: 'Invalid value for companyName' })); }
  const points = 0;
  const totalPoints = 0;
  const role = 3;
  const teamId = 'Dailycieux'
  const result = await insertUser(firstname, lastname, companyName, teamId, role, points, totalPoints);
  res.send(result);
});

app.get('/api/user/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  try {
    const response = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    console.log(response);
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});

app.post('/api/points/win', async (req, res) => {
  const { id, points } = req.body;
  if (points === null || points === NaN || typeof points != 'number') { return res.send(JSON.stringify({ error: 'Invalid value for points' })); }
  console.log(id, points, req.body);
  try {
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const getUser = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    const response = await client.db(dbName).collection('users').updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { points: parseInt(getUser.points) + parseInt(points), totalPoints: parseInt(getUser.points) + parseInt(points) } });
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});

app.post('/api/points/loose', async (req, res) => {
  const { id, points } = req.body;
  if (points === null || points === NaN || typeof points != 'number') { return res.send(JSON.stringify({ error: 'Invalid value for points' })); }
  try{
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const getUser = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    const response = await client.db(dbName).collection('users').updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { points: parseInt(getUser.points + points), totalPoints: parseInt(getUser.points - points) } });
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});

app.post('/api/teams/create', async (req, res) => {
  const {name} = req.body;
  if (name === null || typeof name != 'string') { return res.send(JSON.stringify({ error: 'Invalid value for id' })); }
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('teams').insertOne({
    name: name,
  });
  res.send(result);
});

app.post('/api/events/create', async (req, res) => {
  const {teamId, name, description, reward } = req.body;
  if (teamId === null) { return res.send(JSON.stringify({ error: 'Invalid value for teamId' })); }
  if (name === null) { return res.send(JSON.stringify({ error: 'Invalid value for name' })); }
  if (description === null) { return res.send(JSON.stringify({ error: 'Invalid value for description' })); }
  if (reward === null) { return res.send(JSON.stringify({ error: 'Invalid value for reward' })); }
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('events').insertOne({
    teamId: new mongodb.ObjectId(teamId),
    name: name,
    desciption: description,
    reward: reward
  });
  res.send(result);
});

app.get('/api/events/getAllById/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const response = await client.db(dbName).collection('events').find({ teamId: new mongodb.ObjectId(id) }).toArray();
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});



module.exports = app;