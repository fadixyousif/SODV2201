// function to save data to localStorage
export function saveToStorage(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

// function to load data from localStorage
export function loadFromStorage(key) {
  try {
    const jsonData = localStorage.getItem(key);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading from storage:', error);
    return null;
  }
}