import { query } from "../db.js"




async function get(req, res) {

    try {
        const { section } = req.query;
        const data = await query('SELECT * FROM articles WHERE section = $1', [section]);
        res.json(data.rows);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function post(req, res) {
    console.log("req.body", req.body)
    console.log("req.file", req.file)

    try {
        const { name, shortInfo } = req.body;
        const articleImage = req.file ? req.file.path : null;
        await query('INSERT INTO articles (name, shortinfo, articleimage) VALUES ($1, $2, $3)', [name, shortInfo, articleImage]);
        res.status(200).send({ message: "succsess !!!" });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }

};

async function put(req, res) {
    console.log("Incoming request body:", req.query);
    console.log("Incoming file:", req.file);

    try {
        const { ID, title, paragraph, photo, hide, section, size, placement } = req.query;
        
        
        const articleID = parseInt(ID, 10);
        if (isNaN(articleID)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const articleImage = req.file ? req.file.path : photo;

        let queryText = 'UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5';
        let queryParams = [title, paragraph, articleImage, hide, section];

        if (section === 'beauty') {
            queryText += ', placement = $6 WHERE id = $7';
            queryParams.push(placement, articleID);
        } else if (section === 'fashion') {
            queryText += ', size = $6 WHERE id = $7';
            queryParams.push(size, articleID);
        } else {
            queryText += ' WHERE id = $6';
            queryParams.push(articleID);
        }

        console.log("Executing query:", queryText, queryParams);

        const result = await query(queryText, queryParams);
        console.log('Update result:', result);

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
};


async function del(req, res) {
    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: 'Name is required' });
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



