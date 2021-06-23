const express= require('express')
const app = express();
require('dotenv').config()
//const mongodb = require('mongodb')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const cors = require('cors')
const chalk = require('chalk')
const {customAlphabet} = require('nanoid')

const nanoid = customAlphabet('ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',10);

app
.use(cors())
.use(express.json())
.use(express.urlencoded({extended:true}))
.use(methodOverride('_method'))
.set('view-engine','ejs')

const connect = mongoose.createConnection(process.env.MONGO_URI,{
  //  useCreateIndex:true,
    useFindAndModify:true,
    ignoreUndefined: true,
    useUnifiedTopology : true,
    useNewUrlParser:true
})

let gfs; 

connect.then(()=>{
    console.log(chalk.magenta('Connected to database: GRIDFS'))
    gfs = new mongoose.mongo.GridFSBucket(connect.db,{
        bucketName:'uploads'
    });
}).catch(err => console.log(err))

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads',
                aliases : nanoid()
            };
            resolve(fileInfo);
        });
    }
});


const upload = multer({ storage });

let randomSchema = new mongoose.Schema({},{strict:false});
let Image = mongoose.model('Image',randomSchema);

app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.post('/upload',upload.single('file'),(req,res,next)=>{
    console.log(req.body)
    // check for existing
    Image.findOne({filename : req.body.filename})
    .then((image)=>{
        console.log(image);
        if(image){
        return res.status(200).json({
            success:false,
            message : 'Image already exists'
        });
    }
let newImage = new Image({
    filename : req.file.filename,
    fileId : req.file.id
});

newImage.save()
.then((image)=>{
    res.status(200).json({
        success:true,
        image,
    });
}).catch(err => res.status(500).json(err));

    }).catch(err => res.status(500).json(err));
})

// fetch all file
app.get('/files',(req, res, next) => {
    gfs.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available'
            });
        }

        files.map(file => {
            if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                file.isImage = true;
            } else {
                file.isImage = false;
            }
        });

        res.status(200).json({
            success: true,
            files,
        });
    });
});

app.get('/files/:filename',(req, res, next) => {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
        if (!files[0] || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available',
            });
        }

        res.status(200).json({
            success: true,
            file: files[0],
        });
    });
});



host = '0.0.0.0'
port = process.env.PORT || 3000;
app.listen(port,host,()=>{
    console.log(chalk.magenta(`listening on htts://localhost:${port}`));
})