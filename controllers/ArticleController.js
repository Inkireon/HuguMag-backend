import { query } from "../db.js"




async function get(req, res) { // метод гет 
    try {
        const { category_id } = req.query;
        let queryText;
        let queryParams = [category_id];//в запросе необходимо заложить какую именно категорию статей необходимо вытащить

        switch (category_id) {
            case '3':  //3 это категория fashion которая включает в себя параметр отвечающий размер,поэтому тут в куери есть спецаильные теги отвечающие за это
                queryText = ` 
                    SELECT 
                        a.id,
                        a.title,
                        a.content,
                        a.image_path,
                        a.visibility,
                        c.name AS category_name,
                        f.size AS fashion_size 
                    FROM articles a
                    JOIN categories c ON a.category_id = c.id
                    LEFT JOIN fashion_articles f ON a.id = f.article_id
                    WHERE a.category_id = $1 AND a.visibility = TRUE
                `;
                break;

            case '5':  // 5 категория beauty у нее есть расищиряюший параметр отвечающий за позицию,и в целом она работает как предыдущая
                queryText = `
                    SELECT 
                        a.id,
                        a.title,
                        a.content,
                        a.image_path,
                        a.visibility,
                        c.name AS category_name,
                        b.position AS beauty_position
                    FROM articles a
                    JOIN categories c ON a.category_id = c.id
                    LEFT JOIN beauty_articles b ON a.id = b.article_id
                    WHERE a.category_id = $1 AND a.visibility = TRUE
                `;
                break;

            default:  //куери для всех остальных статей не имеющих расширения
                queryText = `
                    SELECT 
                        a.id,
                        a.title,
                        a.content,
                        a.image_path,
                        a.visibility,
                        c.name AS category_name
                    FROM articles a
                    JOIN categories c ON a.category_id = c.id
                    WHERE a.category_id = $1 AND a.visibility = TRUE
                `;
                break;
        }

        const data = await query(queryText, queryParams);//ожидание пока запрос в базу данных выполнится и вернет значения
        res.json(data.rows);//возвращения результата
    } catch (error) {//ошибка
        console.error('Error querying database:', error);//логирование в случае ошибки с бд 
        res.status(500).send('Internal Server Error');//ответ пользователю
    }
}


async function post(req, res) {//метод пост
    const { title, content, category_id, visibility, fashion_size, beauty_position } = req.body;//параметры которые необходимо заложить в запрос
    const imagePath = req.file ? req.file.path : null;//логика модуля multer которая сохраняет картинку по необходимому пути и присвавает каринке новое имя

    if (!title || !content || !category_id) {
        return res.status(400).json({ message: "Missing required fields" });//выдача ошибки 400 в случае отсутвия этих трех параметров 
    }

    try {
        
        const articleQueryText = `
            INSERT INTO articles (title, content, image_path, visibility, category_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;// сам куери
        const articleParams = [title, content, imagePath, visibility === 'true', category_id];
        
        const result = await query(articleQueryText, articleParams);//ожидание пока запрос в базу данных выполнится и вернет значения
        const articleID = result.rows[0].id;//сохранение результата

        
        if (category_id === '3' && fashion_size) {  //запись расширения в зависимости от категории,в данном случае категория fashion
            const fashionQueryText = `
                INSERT INTO fashion_articles (article_id, size)
                VALUES ($1, $2)
            `;
            await query(fashionQueryText, [articleID, fashion_size]);//ожидание пока запрос расширения в базу данных выполнится и вернет значения
        }

        if (category_id === '5' && beauty_position) {  //запись расширения в зависимости от категории,в данном случае категория beauty
            const beautyQueryText = `
                INSERT INTO beauty_articles (article_id, position)
                VALUES ($1, $2)
            `;
            await query(beautyQueryText, [articleID, beauty_position]);//ожидание пока запрос расширения в базу данных выполнится и вернет значения
        }

        res.status(201).json({ message: "Article added successfully", articleID });//результат в случае успеха 
    } catch (error) {//результат ошибки
        console.error('Error querying database:', error);//логирование в случае ошибки с бд
        res.status(500).json({ message: 'Internal Server Error' });//ответ пользователю
    }
}

//ДЛЯ ПОДРОБНОСТЕЙ ПРО РАСШИРЕНИЯ ЧИТАЙТЕ ДОКУМЕНТАЦИЮ




async function put(req, res) {//метод пут(апдейт)
    console.log("Incoming request body:", req.body);//письменные данные с формата запроса form-data
    console.log("Incoming file:", req.file);//файловые данные с этого же запроса в случае их наличия

    try {
            const currentArticleData = await query('SELECT * FROM articles WHERE id = $1', [articleID]);//выбор артикля по айдишнику и сохранение его данных 

        if (currentArticleData.rows.length === 0) {
            return res.status(404).json({ message: "No matching records found" });//ошибка при отсутвии статьи по айди
        }

        const existingArticle = currentArticleData.rows[0];//хапись уже имеющихся данных

        const updatedTitle = title || existingArticle.title;
        const updatedContent = content || existingArticle.content;
        const updatedImage = req.file ? req.file.path : existingArticle.image_path;
        const updatedVisibility = visibility || existingArticle.visibility;
        const updatedCategoryId = category_id || existingArticle.category_id;//часть логики перезаписи при наличии новых данных

        let queryText = `
            UPDATE articles
            SET title = $1, content = $2, image_path = $3, visibility = $4, category_id = $5
            WHERE id = $6
            `;//куери для обычной статьи

        let queryParams = [updatedTitle, updatedContent, updatedImage, updatedVisibility, updatedCategoryId, articleID];//ее параметры которые мы сохранили 

        if (category_id === '3') { //реализация расширения для категории fashion
            queryText += ' WHERE id = $6';
            queryParams.push(articleID);
            
            await query(`
                INSERT INTO fashion_articles (article_id, size)
                VALUES ($1, $2)
                ON CONFLICT (article_id)
                DO UPDATE SET size = EXCLUDED.size
            `, [articleID, size]);
        } else if (category_id === '5') { //реализация для beauty
            queryText += ' WHERE id = $6';
            queryParams.push(articleID);
            
            await query(`
                INSERT INTO beauty_articles (article_id, position)
                VALUES ($1, $2)
                ON CONFLICT (article_id)
                DO UPDATE SET position = EXCLUDED.position
            `, [articleID, placement]);
        } else {
            queryText += ' WHERE id = $6';
            queryParams.push(articleID);
        }

        console.log("Executing query:", queryText, queryParams);//логирование куери
        const updateResult = await query(queryText, queryParams);//выполнение и ожидание куери 
        console.log('Update result:', updateResult);//логирование результата

        
        const data = await query('SELECT * FROM articles WHERE id = $1', [articleID]);//перепроверка бд
        console.log('Select result:', data.rows);//логирование данных с самоц бд

        if (data.rows.length > 0) {
            res.json(data.rows);
        } else {
            res.status(404).json({ message: "No matching records found" });
        }//ошибка в случае отсутсвия в бд

    } catch (error) {
        console.error('Error querying database:', error);//лог ошибки
        res.status(500).send('Internal Server Error');//выдача результата пользоваетлю
    }
}








async function del(req, res) {//не смотри сюда дел не реализован
    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: 'Title is required' });
        }

        const result = await query('DELETE FROM articles WHERE name = $1', [name]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'Not found' });
        }

        res.status(200).send({ message: '****** deleted successfully' });

    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
};

export default { get, post, put, del };//экспорт методов (в файл "routes") 



