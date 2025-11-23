// import required modules
import dotenv from 'dotenv';
dotenv.config();
import sql from 'mssql';

// sql server configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: false }
};

// sql connection pool
sql.connect(dbConfig)
  .then(() => console.log('SQL Server connected'))
  .catch(err => console.error('SQL connection error:', err));

export default sql;
