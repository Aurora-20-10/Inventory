let data = Array.isArray(window.data) ? [...window.data] : [];

const savedData = localStorage.getItem('inventoryData');
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    if (Array.isArray(parsed)) data = parsed;
  } catch (_) {}
}

const tableBody = document.querySelector('#itemTable tbody');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const addForm = document.getElementById('addForm');
let sortKey = '';
let sortAsc = true;

function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <img src="${item.image || 'https://via.placeholder.com/80'}"
             alt="img" style="max-height:60px; display:block;">
        <div contenteditable="true" 
             oninput="updateData(${index}, 'image', this.innerText)"
             style="font-size:10px; max-width:100px; word-break:break-word; border:1px dashed #ccc; margin-top:5px; padding:2px;">${escapeHTML(item.image)}</div>
      </td>
      <td contenteditable="true" oninput="updateData(${index}, 'name', this.innerText)">${escapeHTML(item.name)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'category', this.innerText)">${escapeHTML(item.category)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'status', this.innerText)">${escapeHTML(item.status)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'note', this.innerText)">${escapeHTML(item.note)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'date', this.innerText)">${escapeHTML(item.date)}</td>
    `;
    tableBody.appendChild(row);
  });
}

function escapeHTML(str='') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function sortItems(items) {
  if (!sortKey) return items;
  return [...items].sort((a, b) => {
    const valA = (a[sortKey] || '').toLowerCase();
    const valB = (b[sortKey] || '').toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });
}

function sortBy(key) {
  if (sortKey === key) {
    sortAsc = !sortAsc;
  } else {
    sortKey = key;
    sortAsc = true;
  }
  updateFilter();
}
window.sortBy = sortBy;

function updateFilter() {
  const category = categoryFilter.value;
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = data.filter(item => {
    const matchCategory = !category || item.category === category;
    const matchKeyword = !keyword ||
      (item.name && item.name.toLowerCase().includes(keyword)) ||
      (item.note && item.note.toLowerCase().includes(keyword)) ||
      (item.status && item.status.toLowerCase().includes(keyword));
    return matchCategory && matchKeyword;
  });
  renderTable(sortItems(filtered));
}

function initFilters() {
  categoryFilter.innerHTML = '<option value="">Tất cả</option>';
  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

categoryFilter.addEventListener('change', updateFilter);
searchInput.addEventListener('input', updateFilter);

initFilters();
updateFilter();

addForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const newItem = {
    name: document.getElementById('newName').value.trim(),
    category: document.getElementById('newCategory').value.trim(),
    date: document.getElementById('newDate').value,
    status: document.getElementById('newStatus').value.trim(),
    note: document.getElementById('newNote').value.trim(),
    image: document.getElementById('newImage').value.trim() || 'https://via.placeholder.com/80'
  };

  data.push(newItem);
  localStorage.setItem('inventoryData', JSON.stringify(data));
  addForm.reset();
  initFilters();
  updateFilter();
});

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
window.exportData = exportData;

function updateData(index, key, value) {
  data[index][key] = value.trim();
  localStorage.setItem('inventoryData', JSON.stringify(data));
  updateFilter();
}
window.updateData = updateData;

function deleteByRowIndex() {
  const input = document.getElementById('rowIndexInput');
  const index = parseInt(input.value, 10) - 1;
  if (isNaN(index) || index < 0 || index >= data.length) {
    alert('Số dòng không hợp lệ!');
    return;
  }

  if (confirm(`Xoá dòng số ${index + 1}?`)) {
    data.splice(index, 1);
    localStorage.setItem('inventoryData', JSON.stringify(data));
    input.value = '';
    initFilters();
  updateFilter();
  }
}
window.deleteByRowIndex = deleteByRowIndex;

function importData() {
  const fileInput = document.getElementById('importJsonInput');
  const file = fileInput.files[0];
  if (!file) return alert('Vui lòng chọn một file JSON!');

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const newData = JSON.parse(e.target.result);
      if (!Array.isArray(newData)) throw new Error();

      const existingKeys = new Set(
        data.map(item => `${item.name}|${item.category}|${item.date}`)
      );

      let addedCount = 0;
      newData.forEach(item => {
        const key = `${item.name}|${item.category}|${item.date}`;
        if (!existingKeys.has(key)) {
          data.push(item);
          existingKeys.add(key);
          addedCount++;
        }
      });

      localStorage.setItem('inventoryData', JSON.stringify(data));
      initFilters();
        updateFilter();
      alert(`✅ Đã bổ sung ${addedCount} mục mới (bỏ qua mục trùng).`);
    } catch (err) {
      alert("File JSON không hợp lệ!");
    }
  };
  reader.readAsText(file);
}
window.importData = importData;

if (typeof module !== "undefined") { module.exports = { escapeHTML }; }
