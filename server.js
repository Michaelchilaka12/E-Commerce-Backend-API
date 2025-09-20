const mongoose = require('mongoose');
const dotenv = require('dotenv');



dotenv.config({path:'./.env'});
const app = require('./app')

//replacing the password tag with the rigth password in my connection string
const DB = process.env.DATABASE.replace('<db_password>',process.env.DATABASE_PASSWORD);

//online database connect
mongoose.connect(DB, {
    // useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify: false
}).then(() => console.log('DB connections successful!'))










const Port = process.env.PORT || 3000;
app.listen(Port, ()=>{
    console.log(`server runing on port ${Port}`);
    
})