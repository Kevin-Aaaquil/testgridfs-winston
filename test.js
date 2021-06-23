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
    gfs = new mongoose.mongo.GridFSBucket(connect.db,{
        bucketName:'uploads'
    });
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
                aliases : 'eshanid'
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({storage});


let randomSchema = new mongoose.Schema({},{strict:false});
let Image = mongoose.model('Image',randomSchema);



app.get('/',(req,res)=>{
    res.render('index.ejs');
});


app.post('/upload',upload.single('file'),(req,res,next)=>{
    console.log(req.body);
    // checking for exixting files
    Image.findOne({caption: req.body.caption})
    .then((image)=>{
        if(image){
            return res.status(200).json({
                success: false,
                message:'Image already exists'
            });
        }

        // uploading

        let newImage = new Image({
            caption:req.body.caption,
            filename: req.file.filename,
            fileId : req.file.id,
        });

        newImage.save().then(()=>{
            console.log(chalk.blue("File added"))
            res.status(200).json({
                success : true,
                message : "File added"
            });
        }).catch(err => res.status(500).json(err));

    }).catch(err => res.status(500).json(err));
})



port = process.env.PORT || 5000;
host = '0.0.0.0'
app.listen(port,host,()=>{
    console.log(chalk.magenta(`listening on http://localhost:${port}`));
})