import express from "express" 
import cors from 'cors'
import ArticlesRoute from "./routes/articles.js";

const PORT = process.env.PORT || 8080
const app = express();


app.use(cors());
app.use(express.json());


app.use("/articles",ArticlesRoute);



app.listen(PORT,() =>{
    console.log("server running")
});