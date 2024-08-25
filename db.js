import pkg from 'pg';
const { Pool } = pkg;
 
const pool = new Pool({
    user: "postgres",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "adl"
})
 
export const query = (text, params) => pool.query(text, params);