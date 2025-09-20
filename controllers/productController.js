const Product = require('../models/productModel');
const factory = require('./handleFactory');


exports.createOne = factory.createOne(Product)
exports.getAll = factory.getAll(Product);
exports.getOne = factory.getOne(Product);
exports.updateOne = factory.updateOne(Product);
exports.deleteOne = factory.deleteOne(Product)





exports.uploadfilePic = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { images: req.file?.path },
      { new: true, runValidators: false } // disable validators for missing fields
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });


    res.json({
      message: "Product picture updated",
      images: updatedProduct.images,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getCategory = async (req,res) =>{
  
// }




// Render all products
exports.renderProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products", { title: "Products", products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Render single product
exports.renderProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render("404", { title: "Product Not Found" });
    }
    res.render("productDetail", { title: product.name, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin list view 
exports.adminListProducts = async (req, res) => {
   const products = await Product.find(); res.render("adminproducts", { products }); };


  //  Render create form 
   exports.renderCreateForm = (req, res) => {
     res.render("adminproductForm", { product: {} }); };


    // Render edit form 
    exports.renderEditForm = async (req, res) => {
       const product = await Product.findById(req.params.id);
        if (!product) return res.redirect("/admin/products");
        res.render("adminproductForm", { product }); };


      // Delete product 
      exports.deleteProduct = async (req, res) => {
         await Product.findByIdAndDelete(req.params.id); res.redirect("/admin/products"); };

exports.getUpdateForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');
  res.render('adminProductEdit', { product });
};

// UPDATE Product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;      // product ID from URL
    const updates = req.body;       // fields to update

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // return updated doc, validate schema
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.redirect("/admin/products")
    res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error updating product',
      error,
    });
  }
};

// Create product with image
exports.createProduct2 = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.body.image) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) throw error;
          imageUrl = result.secure_url;
          saveProduct();
        }
      );
      result.end(req.file.buffer);

      function saveProduct() {
        Product.create({
           name:req.body.name,
           description:req.body.description,
           price:req.body.price,
           category:req.body.category,
           stock:req.body.stock,
           sku:req.body.sku,
            images: imageUrl 
          }).then(() => res.redirect("/admin/products"));
      }
    } else {
      await Product.create(req.body);
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status:'fail',
      message:'data creation not successful'
    })
  }
};

// Update product with optional new image
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/products");

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) throw error;
          product.image = result.secure_url;
          saveUpdated();
        }
      );
      result.end(req.file.buffer);

      function saveUpdated() {
        Object.assign(product, req.body);
        product.save().then(() => res.redirect("/admin/products"));
      }
    } else {
      Object.assign(product, req.body);
      await product.save();
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/admin/products");
  }
};




exports.createOne1 = async (req, res, next) => {
  try {
    const imageUrl = req.body.image; // Cloudinary URL

    // Parse tags (comma separated -> array)
    const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];

    // Parse variants (only first variant for now)
    const variants = [{
      size: req.body["variants[0][size]"],
      color: req.body["variants[0][color]"],
      stock: req.body["variants[0][stock]"]
    }];

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      sku: req.body.sku,
      variants,
      discountPrice: req.body.discountPrice,
      tags,
      images: imageUrl
    };

    const newProduct = await Product.create(productData);
    console.log(newProduct);
    

    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};



// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    // Collect image URLs from Cloudinary
    let images = [];
    if (req.file) {
      images.push(req.file.path); // single image upload
    } else if (req.files) {
      images = req.files.map(file => file.path); // multiple uploads
    }

    // Convert tags from comma-separated string into array
    const tags = req.body.tags
      ? req.body.tags.split(",").map(tag => tag.trim())
      : [];

    // Variants handling (optional)
    let variants = [];
    if (req.body.variants) {
      variants = Array.isArray(req.body.variants)
        ? req.body.variants
        : [req.body.variants];
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand || "",
      stock: req.body.stock,
      sku: req.body.sku,
      discountPrice: req.body.discountPrice || null,
      tags,
      images,
      variants,
    });

     res.status(201).render("signup-success", {
      title: "Product Created Successfully",
      message: "Product created successfully!.",
    });
    
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({
      status: "fail",
      message: "Error creating product",
      error: err.message,
    });
  }
};