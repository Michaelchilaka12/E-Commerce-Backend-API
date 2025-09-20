const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const productController = require('../controllers/productController')
const upload = require('../middleware/uploads')
const analyticsController = require('../controllers/analyticsController');



router.use(authController.protect)
router.use(authController.restrictTo('admin'))

// Admin UI routes
router.get("/products", productController.adminListProducts);
router.get("/products/new", productController.renderCreateForm);
router.post("/products/new", productController.createOne1);

router.get("/products/:id/edit", productController.renderEditForm);
router.post("/products/:id/edit", upload.single("images"), productController.updateProduct);

router.post("/products/:id/delete", productController.deleteProduct);
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;