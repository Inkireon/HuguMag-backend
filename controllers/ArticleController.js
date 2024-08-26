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
    console.log("req.body", req.body);
    console.log("req.file", req.file);
    
    try {
        const { ID, title, paragraph, photo, hide, section, size, placement } = req.body;
        const photoe = req.file ? req.file.path : null;

        let result;

        switch (section) {
            case 'social':
                result = await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE id = $6', 
                [title, paragraph, photo, hide, section, ID]);
                break;
            
            case 'beauty':
                result = await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5, placement = $6 WHERE id = $7', 
                [title, paragraph, photo, hide, section, placement, ID]);
                break;

            case 'fashion':
                result = await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5, size = $6 WHERE id = $7', 
                [title, paragraph, photo, hide, section, size, ID]);
                break;

            default:
                result = await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE id = $6', 
                [title, paragraph, photo, hide, section, ID]);
                break;
        }

        console.log('Update result:', result);

        const data = await query('SELECT * FROM articles WHERE id = $1', [ID]);
        console.log('Select result:', data);

        res.json(data.rows.length > 0 ? data.rows : { message: "No matching records found" });

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
