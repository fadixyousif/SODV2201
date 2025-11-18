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
import { saveToStorage, loadFromStorage } from '../../scripts/StorageSaver';

// MenuManager component
function MenuManager() {
  // state to manage modals, menu items, and warnings
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState({});

  const [warning, setWarning] = useState('');

  // load menu items from storage using useEffect
  useEffect(() => {
    // Load menu items from storage or API if needed
    const loadedMenuItems = loadFromStorage("menuItems");
    if (loadedMenuItems) {
      setMenuItems(loadedMenuItems);
    }
  }, []);

  // functions to manage categories and menu items
  function addCategory(name) {
    // add a new category if it doesn't already exist
    if (name && !menuItems[name]) {
      menuItems[name] = [];
    }
    // update state and save to storage
    setMenuItems(menuItems);
    saveToStorage("menuItems", menuItems);
  }

  // function to remove a category
  function removeCategory(name) {
    // delete the category if it exists
    if (name && menuItems[name]) {
      delete menuItems[name];
    }
    // update state and save to storage
    setMenuItems(menuItems);
    saveToStorage("menuItems", menuItems);
  }

  // function to add a new menu item
  function addMenuItem(item) {
    // add the item to the appropriate category
    if (item && item.category && menuItems[item.category]) {
      menuItems[item.category].push(item);
    }
    // update state and save to storage
    setMenuItems(menuItems);
    saveToStorage("menuItems", menuItems);
  }

  // function to remove a menu item
  function removeMenuItem(item) {
    // remove the item from category
    if (item && item.category && menuItems[item.category]) {
      // filter out the item to be removed
      const updatedMenuItems = { ...menuItems };
      // remove the item from its category
      updatedMenuItems[item.category] = updatedMenuItems[item.category].filter(i => i.id !== item.id);

      // update state and save to storage
      setMenuItems(updatedMenuItems);
      saveToStorage("menuItems", updatedMenuItems);
    }
  }

  // function to edit an existing menu item
  function editMenuItem(updatedItem) {
    // update the item in its category
    if (updatedItem && updatedItem.category && menuItems[updatedItem.category]) {
      // map through the items and update the matching one
      const updatedMenuItems = { ...menuItems };
      // update the specific item
      updatedMenuItems[updatedItem.category] = updatedMenuItems[updatedItem.category].map(item =>
        // replace the item if IDs match
        item.id === updatedItem.id ? updatedItem : item
      );
      // update state and save to storage
      setMenuItems(updatedMenuItems);
      saveToStorage("menuItems", updatedMenuItems);
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
      {warning && (
        <Notification
          message={warning}
          type="danger"
          show={!!warning}
          onClose={() => setWarning('')}
        />
      )}
      <CategoryMenu
        show={showCategoryModal} 
        onHide={() => setShowCategoryModal(false)}
        addCategory={addCategory}
        menuItems={menuItems}
        removeCategory={removeCategory}
        setShowCategoryModal={setShowCategoryModal}
        setWarning={setWarning}
      />
      <MenuItemModal
        show={showMenuItemModal}
        onHide={() => setShowMenuItemModal(false)}
        addMenuItem={addMenuItem}
        menuItems={menuItems}
        setWarning={setWarning}
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