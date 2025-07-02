const express = require('express');
const cors = require('cors');
const {MongoClient, ObjectId } = require('mongodb');


const app = express();
const port = 3000;


const url = 'mongodb://localhost:27017';
const dbName = 'assignment';


app.use(cors());
app.use(express.json());


app.listen(port, () => {
    console.log(`Szerver fut: http://localhost:${port}`);
});


app.post('/api/register', async (req, res) => {
    const user = req.body;

    if (!user.username || !user.email || !user.password) {
        return res.status(400).json({message: 'Hiányzó adatok'});
    }

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        let existing = await collection.findOne({email: user.email});
        if (existing) {
            return res.status(409).json({message: 'Ez az e-mail cím már regisztrálva van!'});
        }

        existing = await collection.findOne({username: user.username});
        if (existing) {
            return res.status(409).json({message: 'Ez a felhasználónév foglalt!'});
        }

        user.createdAt = new Date();
        const result = await collection.insertOne(user);
        res.status(201).json({message: 'Sikeres regisztráció', id: result.insertedId});
    } catch (err) {
        console.error('Hiba a regisztrációnál:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});


app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: 'Hiányzó adatok'});
    }

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        const user = await collection.findOne({username});

        if (!user) {
            return res.status(401).json({message: 'Felhasználó nem található'});
        }

        if (user.password !== password) {
            return res.status(401).json({message: 'Hibás jelszó!'});
        }

        res.json({username: user.username, message: 'Sikeres bejelentkezés!'});

    } catch (err) {
        console.error('Hiba a bejelentkezésnél:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});


app.get('/api/products', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products');

        const {
            search = '',
            category,
            brand,
            sort,
            limit = 10,
            page = 1
        } = req.query;

        const query = {};

        if (search) query.name = {$regex: search, $options: 'i'};
        if (category) query.category = category;
        if (brand) query.brand = brand;

        const total = await collection.countDocuments(query);

        let cursor = collection.find(query);

        if (sort === 'price_asc') cursor = cursor.sort({price: 1});
        else if (sort === 'price_desc') cursor = cursor.sort({price: -1});
        else if (sort === 'name_asc') cursor = cursor.sort({name: 1});
        else if (sort === 'name_desc') cursor = cursor.sort({name: -1});

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const products = await cursor.skip(skip).limit(parseInt(limit)).toArray();

        res.json({
            total,
            products
        });

    } catch (err) {
        console.error('Hiba a termékek lekérdezésénél:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});


app.post('/api/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.brand || !product.category || !product.price) {
        return res.status(400).json({message: 'Hiányzó adatok a termékhez'});
    }

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products');

        product.createdAt = new Date();
        const result = await collection.insertOne(product);

        res.status(201).json({message: 'Termék hozzáadva', id: result.insertedId});
    } catch (err) {
        console.error('Hiba a termék hozzáadásánál:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});


app.put('/api/products/:id', async (req, res) => {
    const {id} = req.params;
    const update = {...req.body};

    delete update._id;

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products');

        console.log('Frissítendő termék ID:', id);

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            {$set: update}
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({message: 'Nincs ilyen termék'});
        }

        res.json({message: 'Termék módosítva!'});
    } catch (err) {
        console.error('Hiba a módosításnál:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});


app.delete('/api/products/:id', async (req, res) => {
    const {id} = req.params;

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products');

        console.log('Törlendő termék ID:', id);

        const result = await collection.deleteOne({_id: new ObjectId(id)});

        if (result.deletedCount === 0) {
            return res.status(404).json({message: 'Nincs ilyen termék' });
        }

        res.json({message: 'Termék törölve!'});
    } catch (err) {
        console.error('Hiba a törlésnél:', err);
        res.status(500).json({message: 'Szerverhiba'});
    } finally {
        await client.close();
    }
});
