import express from "express" ;
import controller from "../controllers/VacancyController.js";//файл контроллеров артикля где мы прописали стандартные http методы


const router = new express.Router();

//все наши роутеры
router.get("/",controller.get)
router.delete("/",controller.del)
router.post("/",controller.post)
router.put("/",controller.put)


router.post("/applications", controller.postApp); // Endpoint to add an application
router.delete("/applications", controller.delApp); // Endpoint to delete an application


export default router//экспорт роутера (в файл index.js)