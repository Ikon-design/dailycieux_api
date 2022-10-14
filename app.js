const express = require('express');
var cors = require('cors');
const app = express();
const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'dailycieux';

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
 res.send("coucou");

});

async function insertUser(firstname, lastname, companyName, teamId, role, points, totalPoints, redeemed) {
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
    role: role,
    redeemed: redeemed ?? false
  });
  return result.insertedId;
}

async function updateUser(firstname, lastname, companyName, teamId, role, points, totalPoints, redeemed) {
  if (teamId === null) { return false; }
  if (role === null || role === NaN || typeof role != 'number') { return false; }
  if (points === null || points === NaN || typeof points != 'number') { return false; }
  if (totalPoints === null || totalPoints === NaN || typeof totalPoints != 'number') { return false; }
  try {
    
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  await client.db(dbName).collection('users').updateOne({_id:mongodb.ObjectId("63487ed4ea34954bc412bc8f")}, {$set:{
    firstname: firstname,
    lastname: lastname,
    companyName: companyName,
    points: points,
    totalPoints: totalPoints,
    teamId: teamId,
    role: role,
    redeemed: redeemed
  }});
  return true;
  } catch (error) {
    return false;
  }
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
  const redeemed = false;
  const result = await insertUser(firstname, lastname, companyName, teamId, role, points, totalPoints, redeemed);
  res.send(result);
});

app.get('/api/user/:id', async (req, res) => {
  const id = req.params.id;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  try {
    const response = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});


app.get('/api/user/redeem/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  try {
    const response = await client.db(dbName).collection('users').findOne({ _id: new mongodb.ObjectId(id) });
    var redeemed = await updateUser(response.firstname, response.lastname, response.companyName, response.teamId, response.role, response.points, response.totalPoints, true);
    return res.send(redeemed);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});

app.post('/api/points/win', async (req, res) => {
  const { id, points } = req.body;
  if (points === null || points === NaN ) { return res.send(JSON.stringify({ error: 'Invalid value for points' })); }
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

app.get('/api/events/getAll', async (req, res) => {
  const id = req.params.id;
  try {
    const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
    const response = await client.db(dbName).collection('events').find({}).toArray();
    res.send(response);
  } catch (error) {
    return res.send(JSON.stringify({ error: 'Invalid value for id' }));
  }
});

app.get('/api/shop/getAll', async (req, res) => {
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  const response = await client.db(dbName).collection('shop').find({}).toArray();
  res.send(response);
});

app.post('/api/shop/create', async (req, res) => {
  const {name, price, image} = req.body;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('shop').insertOne({
    name: name,
    price: price,
    image: image
  });
  res.send(result);
});

app.post('/api/step/create', async(req, res) => {
  const {name, points, image} = req.body;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('step').insertOne({
    name: name,
    points: points,
    image: image
  });
  res.send(result);
});

app.get('/api/step/getAll', async(req, res) => {
  const {name, points, image} = req.body;
  const client = await mongodb.MongoClient.connect(url, { useNewUrlParser: true });
  var result = await client.db(dbName).collection('step').find({}).toArray();
  res.send(result);
})

module.exports = app;