import express from "express" ;
import controller from "../controllers/ArticleController.js";//файл контроллеров артикля где мы прописали стандартные http методы

const storage = multer.diskStorage({//великий и уажсны multer который отвечает за запись файлов на диск,в нашем случае в директория /images
    destination: (req, file, cb) =>{
        cb(null, "images");
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);//присваивает картинке новое имя 
    }
});


const upload = multer({storage})
const router = new express.Router();

//все наши роутеры
router.get("/",controller.get)
router.delete("/",controller.del)
router.post("/",upload.single('articleImage'),controller.post)//роутеры пост и пут используют прописанную нами логику multer,для записи файлов
router.put("/",upload.single('articleImage'),controller.put)

export default router//экспорт роутера (в файл index.js)
