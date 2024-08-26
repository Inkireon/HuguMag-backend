import express from "express" ;
import controller from "../controllers/ArticleController.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "images");
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({storage})
const router = new express.Router();


router.get("/",controller.get)
router.delete("/",controller.del)
router.post("/",upload.single('photo'),controller.post)
router.put("/",upload.single('photo'),controller.put)

export default router
