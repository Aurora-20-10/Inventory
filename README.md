# Inventory
A small static web app for tracking personal items. Everything runs directly in the browser using plain HTML, CSS and JavaScript, so no build process is required.
Data is saved locally in `localStorage` under the key `inventoryData` whenever you add or edit an item. You can also sign in with a Google account to sync your data between devices.

# How to Run
1. Run `npm start` to launch a local server at `http://localhost:8080`. Opening via `file:` will break Google sign-in.
2. Update `js/firebase.js` with your Firebase config and add `localhost` to authorized domains.
3. Visit `http://localhost:8080` and click **Đăng nhập bằng Google** to sign in.

# Folder Structure
index.html – the main page of the application.
style.css – handles the interface styling.
js/main.js – processes logic, data storage, JSON export and import.
data/items.js – optional file containing sample data for preloading.

# Exporting and Importing Data
The 📤 Export JSON button creates a file named inventory_backup.json containing the full current list.
The 📥 Import JSON button lets you select a JSON file to add more data.
All data is stored in localStorage, so it remains intact even after refreshing the page.
