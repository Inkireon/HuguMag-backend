import { query } from "../db.js"




async function get(req, res) {
    try {
        const { category_id } = req.query;
        let queryText;
        let queryParams = [category_id];

        switch (category_id) {
            case '1':  
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

            case '2':  
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

            default:  
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

        const data = await query(queryText, queryParams);
        res.json(data.rows);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}


async function post(req, res) {
    const { title, content, category_id, visibility, fashion_size, beauty_position } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!title || !content || !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        
        const articleQueryText = `
            INSERT INTO articles (title, content, image_path, visibility, category_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        const articleParams = [title, content, imagePath, visibility === 'true', category_id];
        
        const result = await query(articleQueryText, articleParams);
        const articleID = result.rows[0].id;

        
        if (category_id === '1' && fashion_size) {  
            const fashionQueryText = `
                INSERT INTO fashion_articles (article_id, size)
                VALUES ($1, $2)
            `;
            await query(fashionQueryText, [articleID, fashion_size]);
        }

        if (category_id === '2' && beauty_position) {  
            const beautyQueryText = `
                INSERT INTO beauty_articles (article_id, position)
                VALUES ($1, $2)
            `;
            await query(beautyQueryText, [articleID, beauty_position]);
        }

        res.status(201).json({ message: "Article added successfully", articleID });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}






async function put(req, res) {
    console.log("Incoming request body:", req.body);
    console.log("Incoming file:", req.file);

    try {
        const { ID, title, content, image_path, visibility, category_id, size, placement } = req.body;

        const articleID = parseInt(ID, 10);
        if (isNaN(articleID)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const articleImage = req.file ? req.file.path : image_path;

        let queryText = `
            UPDATE articles
            SET title = $1, content = $2, image_path = $3, visibility = $4, category_id = $5
        `;
        let queryParams = [title, content, articleImage, visibility, category_id];

        if (category_id === '3') { 
            queryText += ' WHERE id = $6';
            queryParams.push(articleID);
            
            await query(`
                INSERT INTO fashion_articles (article_id, size)
                VALUES ($1, $2)
                ON CONFLICT (article_id)
                DO UPDATE SET size = EXCLUDED.size
            `, [articleID, size]);
        } else if (category_id === '5') { 
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

        console.log("Executing query:", queryText, queryParams);
        const updateResult = await query(queryText, queryParams);
        console.log('Update result:', updateResult);

        
        const data = await query('SELECT * FROM articles WHERE id = $1', [articleID]);
        console.log('Select result:', data.rows);

        if (data.rows.length > 0) {
            res.json(data.rows);
        } else {
            res.status(404).json({ message: "No matching records found" });
        }

    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}








async function del(req, res) {
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

export default { get, post, put, del };



