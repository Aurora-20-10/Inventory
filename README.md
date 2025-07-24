# Inventory

A small static web app for tracking personal items. Everything runs directly in the browser using plain HTML, CSS and JavaScript, so no build process is required.

Data is saved locally in `localStorage` under the key `inventoryData` whenever you add or edit an item.

## Usage

1. Clone or download this repository.
2. Open `index.html` in your web browser.
3. Use the form to add assets or edit cells in the table. Changes persist automatically.
4. Click **Export JSON** to download a backup of your items.
5. Choose a file next to **Import JSON** and press the button to merge data from a previous backup.

The app stores everything only in your browser until you export it.
