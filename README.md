# Inventory
A small static web app for tracking personal items. Everything runs directly in the browser using plain HTML, CSS and JavaScript, so no build process is required.
Data is saved locally in `localStorage` under the key `inventoryData` whenever you add or edit an item. You can also sign in with a Google account to sync your data between devices.

# How to Run
Simply open index.html in any browser – no server setup required.
For online syncing, update `js/firebase.js` with your own Firebase project configuration.
After launching the page, use the **Đăng nhập bằng Google** button to sign in and keep your items synchronized across devices.

# Folder Structure
index.html – the main page of the application.
style.css – handles the interface styling.
js/main.js – processes logic, data storage, JSON export and import.
data/items.js – optional file containing sample data for preloading.

# Exporting and Importing Data
The 📤 Export JSON button creates a file named inventory_backup.json containing the full current list.
The 📥 Import JSON button lets you select a JSON file to add more data.
All data is stored in localStorage, so it remains intact even after refreshing the page.
