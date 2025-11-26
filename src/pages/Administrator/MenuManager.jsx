// Import necessary modules and components
import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';

// import custom components
import Notification from '../../components/Notification';
import MenuItemModal from '../../components/Administrator/Menu/MenuItemModal';
import CategoryMenu from '../../components/Administrator/Menu/CategoryMenu';
import MenuList from '../../components/Administrator/Menu/MenuList';
import EditMenuItemModal from '../../components/Administrator/Menu/EditMenuItemModal';

// import storage utility functions
import axios from 'axios';
import verifyAuth from '../../scripts/verifyAuth';

// MenuManager component
function MenuManager() {
  // state to manage modals, menu items, and warnings
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState({});

  const [notification, setNotification] = useState(null);

  // load menu items from API and group by category
  useEffect(() => {
    async function loadMenu() {
      try {
        const authResult = await verifyAuth();
        const token = authResult?.token || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // load category list from API (authoritative)
        const catResp = await axios.get('http://localhost:5000/api/menu/categories', { headers });
        const categoryList = catResp.data?.categories || catResp.data || [];

        // initialize categories object with empty arrays
        const categories = {};
        for (const c of categoryList) categories[c.name] = [];

        // fetch items and attach to categories
        const resp = await axios.get('http://localhost:5000/api/menu/items', { headers });
        const items = resp.data.items || resp.data || [];

        for (const item of items) {
          const key = item.category || item.categoryKey || 'Uncategorized';
          if (!categories[key]) categories[key] = [];
          categories[key].push(item);
        }

        console.log('Loaded menu categories and items:', categories);

        setMenuItems(categories);
      } catch (error) {
        console.error('Error loading menu/categories:', error);
      }
    }

    loadMenu();
  }, []);

  // functions to manage categories and menu items
  function addCategory(name) {
    // add a new category via API (admin)
    if (!name) return;
    async function addCategory() {
      try {
        const authResult = await verifyAuth();
        const token = authResult?.token || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await axios.post('http://localhost:5000/api/menu/create/category', { name }, { headers });

        // update local UI state
        setMenuItems(prev => ({ ...(prev || {}), [name]: [] }));
        setNotification({ type: 'success', message: `Category "${name}" created successfully.` });
      } catch (error) {
        console.error('Error creating category:', error);
        setNotification({ type: 'danger', message: error.response?.data.message });
      }
    }
    addCategory();
  }

  // function to remove a category (calls API to delete by id when available)
  function removeCategory(name) {
    if (!name) return;
    async function removeCategory() {
      try {
        const authResult = await verifyAuth();
        const token = authResult?.token || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Call delete endpoint directly (server will validate and perform checks)
        const resp = await axios.delete(`http://localhost:5000/api/menu/category/delete/${encodeURIComponent(name)}`, { headers });

        // update local UI state
        setMenuItems(prev => {
          const copy = { ...(prev || {}) };
          delete copy[name];
          return copy;
        });

        setNotification({ type: 'success', message: resp.data?.message || `Category "${name}" deleted` });
      } catch (error) {
        console.error('Error deleting category:', error);
        setNotification(error.response?.data || { type: 'danger', message: 'Failed to delete category' });
      }
    }
    removeCategory();
  }

  // function to add a new menu item (calls API and refreshes menu)
  async function addMenuItem(item) {
    if (!item) return;
    try {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const body = {
        name: item.name,
        categoryName: item.category || item.categoryKey,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl,
        available: item.available,
      };

      const createResp = await axios.post('http://localhost:5000/api/menu/create/item', body, { headers });
      setNotification({ type: 'success', message: createResp.data?.message || 'Menu item created successfully.' });

      // Insert the new item into local state
      const newItem = { ...item, id: item.id ?? Date.now() };
      // get the category key
      const categoryKey = item.category || item.categoryKey || 'Uncategorized';

      // update state
      setMenuItems(prev => {
        const copy = { ...(prev || {}) };
        if (!copy[categoryKey]) copy[categoryKey] = [];
        copy[categoryKey] = [...copy[categoryKey], newItem];
        return copy;
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      setNotification({ type: 'danger', message: error.response?.data?.message || 'Failed to create menu item' });
    }
  }

  // function to remove a menu item (calls API and updates state)
  async function removeMenuItem(item) {
    if (!item) return;
    try {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const id = item.id;
      // call server to delete item
      const resp = await axios.delete(`http://localhost:5000/api/menu/item/delete/${encodeURIComponent(id)}`, { headers });
      setNotification({ type: 'success', message: resp.data?.message || 'Menu item deleted successfully' });

      // remove item from local state
      setMenuItems(prev => {
        const copy = { ...(prev || {}) };

        // determine category key (fall back to searching if not provided)
        let categoryKey = item.category || item.categoryKey;
        if (!categoryKey) {
          for (const k of Object.keys(copy)) {
            if (copy[k].some(i => i.id === id)) {
              categoryKey = k; break;
            }
          }
        }

        if (categoryKey && copy[categoryKey]) {
          copy[categoryKey] = copy[categoryKey].filter(i => i.id !== id);
        }

        return copy;
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setNotification({ type: 'danger', message: error.response?.data?.message || 'Failed to delete menu item' });
    }
  }

  // function to edit an existing menu item (calls API, updates local state, shows notifications)
  async function editMenuItem(updatedItem) {
    if (!updatedItem || !updatedItem.id) return;
    try {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(updatedItem.id)

      const body = {
        name: updatedItem.name,
        // send categoryId when available; include categoryName as extra info
        categoryName: updatedItem.category || updatedItem.categoryKey,
        price: updatedItem.price,
        description: updatedItem.description,
        imageUrl: updatedItem.imageUrl,
        available: updatedItem.available,
      };

      const resp = await axios.put(
        `http://localhost:5000/api/menu/update/${encodeURIComponent(updatedItem.id)}`,
        body,
        { headers }
      );

      setNotification({ type: 'success', message: resp.data?.message || 'Menu item updated successfully' });

      // update local state: remove any previous occurrence and insert into target category
      setMenuItems(prev => {
        const copy = { ...(prev || {}) };

        // remove from all categories
        for (const k of Object.keys(copy)) {
          copy[k] = copy[k].filter(i => i.id !== updatedItem.id);
        }

        // insert into target category
        const target = updatedItem.category || updatedItem.categoryKey || 'Uncategorized';
        if (!copy[target]) copy[target] = [];
        copy[target] = [...copy[target], updatedItem];

        return copy;
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      setNotification({ type: 'danger', message: error.response?.data?.message || 'Failed to update menu item' });
    }
  }

  // render the MenuManager component
  return (
    <>
      <Card className="p-4" style={{
        background: '#23272b',
        borderColor: '#495057',
        border: '1px solid',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: '#fff'
      }}>
        <h1>Menu</h1>
        <p>This is the Menu Management page for administrators.</p>
        <div className="d-flex flex-row gap-1 mt-4">
          <Button variant="primary" onClick={() => setShowCategoryModal(true)}>
            Manage Categories
          </Button>
          <Button variant="primary" onClick={() => setShowMenuItemModal(true)}>
            Add Menu Item
          </Button>
        </div>
      </Card>
      <MenuList 
        menuItems={menuItems} 
        setEditingItem={setEditingItem}
        setShowEditingModal={setShowEditingModal}
      />
      {notification && (
        <Notification
          show={!!notification}
          onClose={() => setNotification(null)}
          type={notification.type}
          message={notification.message}
        />
      )}
      <CategoryMenu
        show={showCategoryModal} 
        onHide={() => setShowCategoryModal(false)}
        addCategory={addCategory}
        menuItems={menuItems}
        removeCategory={removeCategory}
        setShowCategoryModal={setShowCategoryModal}
        setNotification={setNotification}
      />
      <MenuItemModal
        show={showMenuItemModal}
        onHide={() => setShowMenuItemModal(false)}
        addMenuItem={addMenuItem}
        menuItems={menuItems}
        setNotification={setNotification}
      />
      <EditMenuItemModal
        show={showEditingModal}
        onHide={() => setShowEditingModal(false)}
        item={editingItem}
        removeMenuItem={removeMenuItem}
        editMenuItem={editMenuItem}
      />
    </>
  );
}
  
export default MenuManager;