console.clear();
const express = require('express');
const app = express();

const cors = require('cors')
require('dotenv').config();
const chalk = require('chalk');

// starting from here

const methodOverride = require('method-override')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const Grid = require('gridfs-stream');
const mongoose  = require('mongoose');
const {customAlphabet} = require('nanoid');

const nanoid = customAlphabet('ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',10);


// middleware
app
.use(cors())
.use(express.json())
.use(express.urlencoded({extended:true}))
.set('view-engine','ejs')
.use(methodOverride('_method'))






const connect = mongoose.createConnection(process.env.MONGO_URI,{
    useFindAndModify:true,
    useNewUrlParser: true,
    useUnifiedTopology:true,
    ignoreUndefined:true,
})

let gfs;

connect.then(()=>{
    console.log(chalk.magenta('connected to database'))
    // gfs = new mongoose.mongo.GridFSBucket(connect.db,{
    //     bucketName:'uploads'
    // });
    gfs = Grid(connect.db,mongoose.mongo);
    gfs.collection('uploads')
}).catch(err => console.log(err));

// creating storage engine

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    file: (req,file)=>{
        return new Promise((resolve,reject)=>{
            //encrypt filename before storing it
            const filename = file.originalname;
            const fileInfo = {
                filename:filename,
                bucketName : 'uploads',
                aliases : nanoid(),
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({storage});


let randomSchema = new mongoose.Schema({},{strict:false});
let Image = mongoose.model('Image',randomSchema);


// home page
app.get('/',(req,res)=>{
    res.render('index.ejs');
});

// upload single file
app.post('/upload',upload.single('file'),(req,res,next)=>{
   res.redirect('/')
})

// to view all files stored
app.post('/files',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        // checks if files exists
        if(!files || files.length === 0){
            return res.status(404).json({
                success :false,
                "message":"No files exist"
            }) 
        }

        return res.json(files);
    });
});

// to view particular file
app.post('/file',(req,res)=>{
    gfs.files.findOne({aliases : req.body.aliases},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({
                success : false,
                err : "No file exists"
            });
        }
       return res.json(file)
        
        
    })
});



app.use((req, res)=>{
    res.status(404).send('<h1>404: Page Not Found</h1>');
});

port = process.env.PORT || 3000;
host = '0.0.0.0'
app.listen(port,host,()=>{
    console.log(chalk.magenta(`listening on http://localhost:${port}`));
})