const Paystack = require("paystack-api");
module.exports = Paystack(process.env.PAYSTACK_SECRET_KEY);
