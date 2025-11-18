

export async function registerCheckUserExists(sql, email) {
    try {
        const result = await sql.query`
            SELECT COUNT(*) AS count FROM accounts WHERE email = ${email}
        `;
        return result.recordset[0].count > 0;
    } catch (err) {
        console.error("Database query error:", err);
        return false;        
    }

}
