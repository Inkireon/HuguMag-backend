import { query } from "../db.js";

// GET method: Retrieve vacancies
async function get(req, res) {
    try {
        const data = await query(`
            SELECT 
                vacancy_id, 
                title, 
                description, 
                requirements, 
                salary_min, 
                salary_max, 
                employment_type, 
                posted_date, 
                closing_date 
            FROM vacancies
        `);
        res.json(data.rows);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}

// POST method: Create a new vacancy
async function post(req, res) {
    const { title, description, requirements, salary_min, salary_max, employment_type, closing_date } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const result = await query(`
            INSERT INTO vacancies (title, description, requirements, salary_min, salary_max, employment_type, closing_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING vacancy_id
        `, [title, description, requirements, salary_min, salary_max, employment_type, closing_date]);

        const vacancyID = result.rows[0].vacancy_id;
        res.status(201).json({ message: "Vacancy added successfully", vacancyID });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// PUT method: Update an existing vacancy
async function put(req, res) {
    const { vacancy_id, title, description, requirements, salary_min, salary_max, employment_type, closing_date } = req.body;

    if (!vacancy_id) {
        return res.status(400).json({ message: "vacancy_id is required" });
    }

    try {
        const currentData = await query('SELECT * FROM vacancies WHERE vacancy_id = $1', [vacancy_id]);

        if (currentData.rows.length === 0) {
            return res.status(404).json({ message: "No matching records found" });
        }

        const updatedTitle = title || currentData.rows[0].title;
        const updatedDescription = description || currentData.rows[0].description;
        const updatedRequirements = requirements || currentData.rows[0].requirements;
        const updatedSalaryMin = salary_min || currentData.rows[0].salary_min;
        const updatedSalaryMax = salary_max || currentData.rows[0].salary_max;
        const updatedEmploymentType = employment_type || currentData.rows[0].employment_type;
        const updatedClosingDate = closing_date || currentData.rows[0].closing_date;

        await query(`
            UPDATE vacancies
            SET title = $1, description = $2, requirements = $3, salary_min = $4, salary_max = $5, employment_type = $6, closing_date = $7
            WHERE vacancy_id = $8
        `, [updatedTitle, updatedDescription, updatedRequirements, updatedSalaryMin, updatedSalaryMax, updatedEmploymentType, updatedClosingDate, vacancy_id]);

        res.status(200).json({ message: "Vacancy updated successfully" });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}

// DELETE method: Delete a vacancy
async function del(req, res) {
    const { vacancy_id } = req.body;

    if (!vacancy_id) {
        return res.status(400).json({ message: 'vacancy_id is required' });
    }

    try {
        const result = await query('DELETE FROM vacancies WHERE vacancy_id = $1', [vacancy_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }

        res.status(200).json({ message: 'Vacancy deleted successfully' });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}

// POST method: Add an application to a specific vacancy
async function postApp(req, res) {
    const { vacancy_id, applicant_name, application_text } = req.body;

    if (!vacancy_id || !applicant_name || !application_text) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        await query(`
            INSERT INTO applications (vacancy_id, applicant_name, application_text, application_date)
            VALUES ($1, $2, $3, CURRENT_DATE)
        `, [vacancy_id, applicant_name, application_text]);

        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function delApp(req, res) {
    const { application_id } = req.body;

    if (!application_id) {
        return res.status(400).json({ message: 'application_id is required' });
    }

    try {
        const result = await query('DELETE FROM applications WHERE application_id = $1', [application_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
}

export default { get, post, put, del, postApp,delApp };
