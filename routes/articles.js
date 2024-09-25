import express from "express" ;
import controller from "../controllers/ArticleController.js";
import multer from "multer";
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "images");
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const deleteFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

const upload = multer({storage})
const router = new express.Router();


router.get("/",controller.get)
router.delete("/",controller.del)
router.post("/",upload.single('articleImage'),controller.post)
router.put("/",upload.single('articleImage'),controller.put)

export default router
