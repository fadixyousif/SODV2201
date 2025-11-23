// check if user with same email exists
export async function registerCheckUserExists(sql, email) {
    try {
        // query to check if user with the same email exists
        const result = await sql.query`
            SELECT COUNT(*) AS count FROM accounts WHERE email = ${email}
        `;
        return result.recordset[0].count > 0;
    } catch (err) {
        // handle errors
        console.error("Database query error:", err);
        return false;        
    }
}

// check if category with same name exists
export async function categoriesDuplicateCheck(sql, name) {
    try {
        // query to check if category name exists
        const result = await sql.query`
            SELECT COUNT(*) AS count FROM Categories WHERE name = ${name}
        `;
        // return true if count > 0
        return result.recordset[0].count > 0;
    } catch (err) {
        // handle errors
        console.error("Database query error:", err);
        return false;
    }
}

// check if menu item with same name exists
export async function checkCategoryExists(sql, categoryId) {
    try {
        // query to check if category exists
        const result = await sql.query`
            SELECT COUNT(*) AS count FROM Categories WHERE id = ${categoryId}
        `;
        // return true if count > 0
        return result.recordset[0].count > 0;
    } catch (err) {
        // handle errors
        console.error("Database query error:", err);
        return false;
    }
}

// isAdministrator check by checking role from accounts table
export async function isAdministrator(sql, email) {
    try {
        const result = await sql.query`
            SELECT role FROM accounts WHERE email = ${email}
        `;
        if (result.recordset.length === 0) {
            return false;
        }
        return result.recordset[0].role === 'administrator';
    } catch (err) {
        console.error("Database query error:", err);
        return false;
    }
}

// check if category has associated menu items
export async function hasMenuItems(sql, categoryId) {
    try {
        const result = await sql.query`
            SELECT COUNT(*) AS count FROM MenuItems WHERE categoryId = ${categoryId}
        `;
        return result.recordset[0].count > 0;
    } catch (err) {
        console.error("Database query error:", err);
        return false;
    }
}