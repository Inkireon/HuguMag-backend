import express from "express" 
import cors from 'cors'
import ArticlesRoute from "./routes/articles.js";

const PORT = process.env.PORT || 8080
const app = express();


app.use(cors());// корсы 
app.use(express.json());//работа с json

app.use('/images', express.static('images'));//эта строка позволяет доставать картинки по URL
app.use("/articles",ArticlesRoute);//использование роута артиклей с файла routes



app.listen(PORT,() =>{
    console.log("server running")//лог запуска сервера
});