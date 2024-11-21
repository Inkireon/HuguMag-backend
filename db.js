import pkg from 'pg';
const { Pool } = pkg;
 
const pool = new Pool({//данные бд
    user: "postgres",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "adl"
})
 
export const query = (text, params) => pool.query(text, params);//метод query которые позволяет запускать куери через код