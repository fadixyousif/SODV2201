import express from 'express';
import sql from '../db.js';
import { verifyToken } from '../modules/authentication.js';
import { isMenuItemValid } from '../modules/validation.js';
import { categoriesDuplicateCheck, checkCategoryExists, isAdministrator, hasMenuItems } from '../modules/queries.js';

const router = express.Router();

// get menu items not requiring authentication
router.get('/items', async (req, res) => {
    // fetch all menu items with their categories
    try {
        // query to get menu items with category names
        const listReq = new sql.Request();
        const result = await listReq.query(
            `SELECT 
                mi.id,
                mi.name,
                c.name AS category,
                mi.price,
                mi.description,
                mi.imageUrl,
                mi.available
            FROM MenuItems mi
            JOIN Categories c ON mi.categoryId = c.id`
        );

        // check if any no menu items found if yes return 404
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No menu items found'
            });
        }
        
        // return the menu items
        return res.status(200).json({
            success: true,
            items: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching menu items:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    
});

// create categories requiring authentication
router.post('/create/category', verifyToken, async (req, res) => {
    // check if user is administrator
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const { name } = req.body || {};

    // category name validation
    if (!name || name.length < 3 || name.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Category name must be between 3 and 50 characters'
        });
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({
            success: false,
            message: 'Category name must contain only letters and spaces'
        });
    }

    try {
        // check for duplicate category
        if (await categoriesDuplicateCheck(sql, name)) {
            return res.status(409).json({
                success: false,
                message: 'Category already exists'
            });
        }

        // insert new category
        const insertCatReq = new sql.Request();
        insertCatReq.input('name', sql.NVarChar(50), name);
        const result = await insertCatReq.query('INSERT INTO Categories (name) VALUES (@name)');

        // check if insert was successful if rowsAffected is 0 then return error
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create category'
            });
        }

        // successful category creation
        return res.status(201).json({
            success: true,
            message: 'Category created successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error creating category:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// create menu items requiring authentication
router.post('/create/item', verifyToken, async (req, res) => {
    // check if user is administrator
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    // get menu item data from request body
    const { name, categoryId, price, description, imageUrl, available } = req.body || {};

    // check for missing required fields
    if (!name || !categoryId || !price || available === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // validate menu item data
    const validationResult = isMenuItemValid(name, categoryId, price, description, available);
    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }
        // insert new menu item
        const insertItemReq = new sql.Request();
        insertItemReq.input('name', sql.NVarChar(100), name);
        insertItemReq.input('categoryId', sql.Int, Number(categoryId));
        insertItemReq.input('price', sql.Decimal(10,2), price);
        insertItemReq.input('description', sql.NVarChar(300), description || null);
        insertItemReq.input('imageUrl', sql.NVarChar(300), imageUrl || null);
        insertItemReq.input('available', sql.Bit, available ? 1 : 0);
        const result = await insertItemReq.query(
            'INSERT INTO MenuItems (name, categoryId, price, description, imageUrl, available) VALUES (@name, @categoryId, @price, @description, @imageUrl, @available)'
        );

        // check if insert was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create menu item'
            });
        }

        // successful menu item creation
        return res.status(201).json({
            success: true,
            message: 'Menu item created successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error creating menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// delete categories requiring authentication
router.delete('/category/delete/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const categoryId = Number(req.params.id);

    // validate categoryId
    if (isNaN(categoryId) || categoryId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
        });
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // check if category has associated menu items
        if (await hasMenuItems(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with associated menu items'
            });
        }
        // delete the category
        const delCatReq = new sql.Request();
        delCatReq.input('id', sql.Int, categoryId);
        const result = await delCatReq.query('DELETE FROM Categories WHERE id = @id');

        // check if delete was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category'
            });
        }

        // successful category deletion
        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error deleting category:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    
});

// delete menu items requiring authentication
router.delete('/item/delete/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const itemId = Number(req.params.id);

    // validate itemId
    if (isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item ID'
        });
    }

    try {
        // delete the menu item
        const delItemReq = new sql.Request();
        delItemReq.input('id', sql.Int, itemId);
        const result = await delItemReq.query('DELETE FROM MenuItems WHERE id = @id');

        // check if delete was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // successful menu item deletion
        return res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error deleting menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// update menu items requiring authentication
router.put('/update/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const itemId = Number(req.params.id);
    const { name, categoryId, price, description, imageUrl, available } = req.body || {};

    // validate itemId
    if (isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item ID'
        });
    }

    // validate menu item data
    const validationResult = isMenuItemValid(name, categoryId, price, description, available);

    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }

        // update the menu item
        const updReq = new sql.Request();
        updReq.input('name', sql.NVarChar(100), name);
        updReq.input('categoryId', sql.Int, Number(categoryId));
        updReq.input('price', sql.Decimal(10,2), price);
        updReq.input('description', sql.NVarChar(300), description || null);
        updReq.input('imageUrl', sql.NVarChar(300), imageUrl || null);
        updReq.input('available', sql.Bit, available ? 1 : 0);
        updReq.input('id', sql.Int, itemId);
        const result = await updReq.query(
            'UPDATE MenuItems SET name = @name, categoryId = @categoryId, price = @price, description = @description, imageUrl = @imageUrl, available = @available WHERE id = @id'
        );
        // check if update was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        // successful menu item update
        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error updating menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;
