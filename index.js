const express = require('express');
const jwt = require('jsonwebtoken');//require jwt
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { ObjectId } = require('mongodb');
//middleware
app.use(cors());
app.use(express.json());

// //verify token
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];//split token from authHeader
    jwt.verify(token, fd32b1f08ed9ff22413b461ca67aa1324ba9291f7de5f5281f1141d6eb7221b28ef3b6d15a19b62be1cf64abc3eab03fba22234cbef5e32fcf2b56dd109f4c03, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

//DB access
const uri = `mongodb+srv://sisdbuser:n8ttANj0h2SrgEZA@cluster0.74f46.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//api function
async function run() {
    try {
        await client.connect();
        const database = client.db("petHeaven");
        const petsCollection = database.collection("pets");
        const usersCollection = database.collection("users");
        //find all pets or current user's pets
        app.get('/pets', async (req, res) => {
            const user = req.query.user;
            const query = user ? { user: user } : {};//run query for specific user or return all
            const pets = await petsCollection.find(query).toArray();
            res.json(pets);
        });
        //get single pet
        app.get('/pet/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const singlepet = await petsCollection.findOne(query);
            res.json(singlepet);
        })
        //Inserting pet
        app.post('/add-pet', async (req, res) => {
            const pet = req.body;
            const result = await petsCollection.insertOne(pet);
            res.json(result);
        });
        //delete a pet
        app.delete('/pet/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await petsCollection.deleteOne(query);
            res.json(result);
        });
        //find all users
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find({}).toArray();
            res.json(users);
        });
        //delete a user
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id; // Get the id parameter from the request
            const query = { _id: new ObjectId(id) }; // Define the query to find the user by id
            const result = await usersCollection.deleteOne(query);
            res.json(result);
        });
        //find current user
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });
        //user register
        app.post('/add-user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

//default route
app.get('/', (req, res) => {
    res.send('Running Pet Heaven server');
});
app.listen(port, () => {
    console.log('running on Pet Heaven server', port);
});