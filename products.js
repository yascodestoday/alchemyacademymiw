const express = require('express');
const router = express.Router();

// Sample product data - you can replace this with a database later
const products = [
    {
        id: 1,
        name: "Basic Alchemy Guide",
        price: 29.99,
        description: "Perfect for beginners starting their alchemy journey",
        image: "/alchemy-acadedmy/images/book1.jpg"
    },
    {
        id: 2,
        name: "Advanced Potion Making",
        price: 49.99,
        description: "Master the art of complex potion brewing",
        image: "/alchemy-acadedmy/images/book2.jpg"
    },
    {
        id: 3,
        name: "Elemental Transmutation",
        price: 39.99,
        description: "Learn the fundamentals of transforming elements",
        image: "/alchemy-acadedmy/images/book3.jpg"
    }
];

// Get all products
router.get('/', (req, res) => {
    res.json(products);
});

// Get single product by ID
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

module.exports = router;