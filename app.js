const path = require('path')
const express = require('express');
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const hpp = require('hpp')
const cookieParser = require('cookie-parser');

const paystackRoutes = require("./routes/paystackRoutes");
const viewRoutes = require("./routes/viewRoutes");
const globalErrorHandler = require('./controllers/errorController')


const userRouter = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require('./routes/adminRoutes')



const app = express();
app.use(cors({
  origin: 'http://localhost:3000',   // your frontend origin
  credentials: true                  // ✅ allow cookies
}));


//using a template view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))


//how to serve a static file
app.use(express.static(path.join(__dirname, 'public')))

// //body parser, reading data from body into req.body
// app.use(express.json({limit: '10kb'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


//mounting route
app.use("/api/v1/paystack", paystackRoutes);

app.use("/", viewRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use('/products', productRoutes);
app.use('/admin',adminRoutes)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart',cartRoutes);
app.use("/api/v1/orders", orderRoutes);





//error handling middleware
app.use(globalErrorHandler)

module.exports = app;