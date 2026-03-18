import Product from "../models/Product.js";

// CREATE PRODUCT
export const addProduct = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      details,
      brand,
      price,
      discountPrice,
      offer,
      category,
      stock,
      attributes,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    //   const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    // const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const imageUrl = `/uploads/${req.file.filename}`;

    const product = await Product.create({
      title,
      subtitle,
      details,
      brand,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      offer: Number(offer),
      category,
      stock: Number(stock),
      images: [imageUrl],
      attributes: attributes ? JSON.parse(attributes) : {},
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields
    const {
      title,
      subtitle,
      details,
      brand,
      price,
      discountPrice,
      offer,
      category,
      stock,
      attributes
    } = req.body;

    if (title) product.title = title;
    if (subtitle) product.subtitle = subtitle;
    if (details) product.details = details;
    if (brand) product.brand = brand;
    if (price) product.price = Number(price);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (offer) product.offer = Number(offer);
    if (category) product.category = category;
    if (stock) product.stock = Number(stock);
    if (attributes) product.attributes = JSON.parse(attributes);

    // Update image if new file is uploaded
    if (req.file) {
       // Dynamic full URL
    // const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    // const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

            // const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

            const imageUrl = `/uploads/${req.file.filename}`;

      product.images = [imageUrl];
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

// ADD REVIEW
export const addReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const newReview = {
    userId: req.user._id,
    userName: req.user.name,
    userProfile: req.user.profilePic,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };

  product.reviews.push(newReview);
  product.ratings.count = product.reviews.length;
  product.ratings.average =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) /
    product.reviews.length;

  await product.save();
  res.json({ message: "Review added" });
};

// ADVANCED SEARCH / FILTER / PAGINATION
export const getProductsAdvanced = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort,
    category,
    priceMin,
    priceMax,
    ratingMin,
    ratingMax,
    keyword,
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (ratingMin || ratingMax) {
    query["ratings.average"] = {};
    if (ratingMin) query["ratings.average"].$gte = Number(ratingMin);
    if (ratingMax) query["ratings.average"].$lte = Number(ratingMax);
  }
  if (keyword) {
    query.title = { $regex: keyword, $options: "i" };
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating_desc") sortOption = { "ratings.average": -1 };

  const products = await Product.find(query)
    .sort(sortOption)
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Product.countDocuments(query);
  res.json({ page: Number(page), total, products });
};