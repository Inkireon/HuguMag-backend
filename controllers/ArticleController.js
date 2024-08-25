import {query} from "../db.js"




async function get(req, res) {
    
    try {
        const { section } = req.query;
        const data = await query('SELECT * FROM articles WHERE section = $1',[section]);
        res.json(data.rows);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function post(req, res) {
    console.log("req.body",req.body)
    console.log("req.file",req.file) 

    try {
        const { name, shortInfo} = req.body;
        const articleImage = req.file ? req.file.path : null; 
        await query('INSERT INTO articles (name, shortinfo, articleimage) VALUES ($1, $2, $3)', [name, shortInfo, articleImage]);
        res.status(200).send({ message: "succsess !!!" });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }

};

async function put(req, res) {
    console.log("req.body",req.body)
    console.log("req.file",req.file) 
    try {
        const { ID,title, paragraph, photo, hide, section, size , placement} = req.body;
        const articleImage = req.file ? req.file.path : null;
    
            switch (section) {
                case 'social':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE ID = $6', [title, paragraph, photo, hide, section, ID]);
                    break;
        
                case 'beauty':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5, placement = $6 WHERE ID = $7', [title, paragraph, photo, hide, section, placement, ID]);
                    break;
        
                case 'art':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE ID = $6', [title, paragraph, photo, hide, section, ID]);
                    break;

                case 'events':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE ID = $6', [title, paragraph, photo, hide, section, ID]);
                    break;

                case 'top-news':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE ID = $6', [title, paragraph, photo, hide, section, ID]);
                    break;
        
                case 'fashion':
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5, size = $6 WHERE ID = $7', [title, paragraph, photo, hide, section, size, ID]);
                    break;
        
                default:
                    await query('UPDATE articles SET title = $1, paragraph = $2, photo = $3, hide = $4, section = $5 WHERE ID = $6', [title, paragraph, photo, hide, section, ID]);
                    break;
            }
        
            res.status(200).send({ message: "success !!!" });
        
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
