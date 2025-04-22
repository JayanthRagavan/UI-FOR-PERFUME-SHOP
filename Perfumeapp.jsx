/* Backend: Node.js + Express + MongoDB */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/perfumeShop", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  sizes: [String],
  reviews: [{ user: String, comment: String }],
});

const Product = mongoose.model("Product", ProductSchema);

app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

app.post("/products/:id/review", async (req, res) => {
  const { user, comment } = req.body;
  await Product.findByIdAndUpdate(req.params.id, {
    $push: { reviews: { user, comment } },
  });
  res.json({ message: "Review added" });
});

app.listen(5000, () => console.log("Server running on port 5000"));

/* Frontend: React (App.js) */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/products").then((response) => {
      setProducts(response.data);
    });
  }, []);

  return (
    <div className="container">
      <nav className="navbar">Perfume Shop</nav>
      <div className="banner">Discover Your Signature Scent</div>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <button onClick={() => window.location.href=`/product/${product._id}`}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

/* Frontend: React (ProductPage.js) */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/products/${id}`).then((response) => {
      setProduct(response.data);
    });
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details">
      <h2>{product.name}</h2>
      <img src={product.images[0]} alt={product.name} />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <h3>Reviews:</h3>
      <ul>
        {product.reviews.map((review, index) => (
          <li key={index}><strong>{review.user}:</strong> {review.comment}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductPage;
