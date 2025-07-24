let data = [];
if (typeof window !== 'undefined') {
  data = Array.isArray(window.data) ? [...window.data] : [];
  const savedData = localStorage.getItem('inventoryData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed)) data = parsed;
    } catch (_) {}
  }
}

let tableBody, categoryFilter, searchInput, addForm;
if (typeof document !== 'undefined') {
  tableBody = document.querySelector('#itemTable tbody');
  categoryFilter = document.getElementById('categoryFilter');
  searchInput = document.getElementById('searchInput');
  addForm = document.getElementById('addForm');
}

function isImageLink(str='') {
  return /^https?:\/\//i.test(str.trim());
}

function renderTable(items) {
  tableBody.innerHTML = '';
items.forEach((item) => {
    const index = data.indexOf(item); // correct index within main array
    const row = document.createElement('tr');

    const noteContent = isImageLink(item.note)
      ? `<img src="${item.note}" alt="note" style="max-height:60px; display:block;">`
      : escapeHTML(item.note);  
  
    row.innerHTML = `
      <td>
         <img src="${escapeHTML(item.image || 'https://via.placeholder.com/80')}"
             alt="img" style="max-height:60px; display:block;" onclick="editImage(${index})">
      </td>
      <td contenteditable="true" oninput="updateData(${index}, 'name', this.innerText)">${escapeHTML(item.name)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'category', this.innerText)">${escapeHTML(item.category)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'status', this.innerText)">${escapeHTML(item.status)}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'note', this.innerText)">${noteContent}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'date', this.innerText)">${escapeHTML(item.date)}</td>
      <td><button onclick="deleteRow(${index})">❌</button></td>

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
   renderTable(filtered);
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
 renderTable(data);

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
  if (typeof saveToFirestore === 'function') saveToFirestore();
  addForm.reset();
  initFilters();
   renderTable(data);
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

function editImage(index) {
  const url = prompt('Nhập link ảnh:', data[index].image || '');
  if (url === null) return; // cancel
  data[index].image = url.trim() || 'https://via.placeholder.com/80';
  localStorage.setItem('inventoryData', JSON.stringify(data));
  if (typeof saveToFirestore === 'function') saveToFirestore();
  renderTable(data);
}
window.editImage = editImage;
function updateData(index, key, value) {
  data[index][key] = value.trim();
  localStorage.setItem('inventoryData', JSON.stringify(data));
  if (typeof saveToFirestore === 'function') saveToFirestore();
   renderTable(data);
}
window.updateData = updateData;

function deleteRow(index) {
  if (confirm(`Xoá dòng số ${index + 1}?`)) {
    data.splice(index, 1);
    localStorage.setItem('inventoryData', JSON.stringify(data));
    if (typeof saveToFirestore === 'function') saveToFirestore();
    initFilters();
    renderTable(data);
  }
}
window.deleteRow = deleteRow;

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
      if (typeof saveToFirestore === 'function') saveToFirestore();
      initFilters();
         renderTable(data);
      alert(`✅ Đã bổ sung ${addedCount} mục mới (bỏ qua mục trùng).`);
    } catch (err) {
      alert("File JSON không hợp lệ!");
    }
  };
  reader.readAsText(file);
}
window.importData = importData;

if (typeof module !== "undefined") { module.exports = { escapeHTML }; }
