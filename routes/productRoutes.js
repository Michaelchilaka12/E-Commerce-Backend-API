const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController')
const upload = require('../middleware/uploads')

const router = express.Router();

router.use(authController.protect)
router.use(authController.restrictTo('admin'))

router.route('/').post(productController.createOne).get(productController.getAll)

router.route('/:id').get(productController.getOne)
.patch(productController.updateOne).delete(productController.deleteOne)
router.post("/:id/edit",productController.updateProduct)
router.post("/:id/delete",productController.deleteOne)
router.post("/adminCreateProduct",upload.single("image"),productController.createProduct)
router.post("/:id/uploadProductPic", upload.single("images"), productController.uploadfilePic);






module.exports = router