import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import Product from './models/product';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;  // Use PORT from .env or default to 3000
const mongoUri = process.env.MONGO_URI;
console.log("MONGO_URI:", process.env.MONGO_URI);

const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ];
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Gracie from Docker Express! 🚀');
});
app.get('/home', (req, res) => {
  res.send('Welcome to the Home Page! 🏠');
});
app.get('/about', (req, res) => {
  res.send('Welcome to the About Page! 📚');
});
app.get('/users', (req: Request, res) => {
  res.json(users);
});
app.get("/users/:id", (req: Request<{ id: string }>, res: Response) => {  
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});
app.get("/products/:sku", async (req: Request, res: Response) => {
  try {
    const sku = req.params.sku;
    const product = await Product.findOne({ sku });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) { 
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});
app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
} );

// curl -X POST http://localhost:3300/add_product -H "Content-Type: application/json" -d '{"name":"ginger", "sku":"sku202","qty":10}'
// curl -X POST http://localhost:3300/add_product -H "Content-Type: application/json" -d '{"name":"shampoo","sku":"sku001","qty":25}'
// curl -X POST http://localhost:3300/add_product -H "Content-Type: application/json" -d '{"name":"conditioner101","sku":"sku101","qty":5}'
// curl -X POST http://localhost:3300/add_product -H "Content-Type: application/json" -d '{"name":"shampoo+cond","sku":"sku102","qty":5}'

app.post('/add_product', async (req: Request, res: Response) => {
  console.log("...MONGO_URI:", process.env.MONGO_URI);
  try {
    const newProduct = new Product(req.body);""
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product. May be duplicate SKU, or Name' });
  }
} );
app.put('/update_product/:sku', async (req: Request, res: Response) => {
  try {
    const sku = req.params.sku;
    const updatedProduct = await Product.findOneAndUpdate({ sku }, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
} );
// MongoDB connection
if (!mongoUri) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}
mongoose.connect(mongoUri )
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});