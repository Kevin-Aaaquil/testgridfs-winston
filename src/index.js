console.clear();
require('dotenv').config();
const chalk = require('chalk')
const express=require('express');
const path = require('path')
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cors = require('cors');

const app = express();

//middleware
app
.use(cors())
.use(express.json())
.use(express.urlencoded({extended:true}))
.set('view-engine','ejs');


// Create mongo connection
const conn = mongoose.createConnection(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>{
    console.log(chalk.blue('mongoose connection initialized'))
})

app.get('/',(req,res)=>{
    res.render('index.ejs')
})


port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(chalk.magenta(`listening on http://localhost:${port}`));
})