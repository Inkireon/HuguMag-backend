import pkg from 'pg';
const { Pool } = pkg;
 
const pool = new Pool({
const pool = new Pool({//данные бд
})
 
export const query = (text, params) => pool.query(text, params);//метод query которые позволяет запускать куери через код