// Quản Lý Tài Sản Cá Nhân - Aurora
let data = Array.isArray(window.data) ? [...window.data] : [];

const savedData = localStorage.getItem('inventoryData');
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    if (Array.isArray(parsed)) data = parsed;
  } catch (_) {}
}

const tableBody      = document.querySelector('#itemTable tbody');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput    = document.getElementById('searchInput');
const addForm        = document.getElementById('addForm');

function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox" data-index="${data.indexOf(item)}"></td>
      <td onpaste="handleImagePaste(event, ${data.indexOf(item)})" style="padding:0; cursor:pointer;">
        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="img" style="display:block; max-height:60px;">
      </td>
      <td contenteditable="true" oninput="updateData(${data.indexOf(item)}, 'name', this.innerText)">${escapeHTML(item.name)}</td>
      <td contenteditable="true" oninput="updateData(${data.indexOf(item)}, 'category', this.innerText)">${escapeHTML(item.category)}</td>
      <td contenteditable="true" oninput="updateData(${data.indexOf(item)}, 'status', this.innerText)">${escapeHTML(item.status)}</td>
      <td contenteditable="true" oninput="updateData(${data.indexOf(item)}, 'note', this.innerText)">${escapeHTML(item.note)}</td>
      <td contenteditable="true" oninput="updateData(${data.indexOf(item)}, 'date', this.innerText)">${escapeHTML(item.date)}</td>
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
  const keyword  = searchInput.value.trim().toLowerCase();
  const filtered = data.filter(item => {
    const matchCategory = !category || item.category === category;
    const matchKeyword  = !keyword ||
      (item.name   && item.name.toLowerCase().includes(keyword)) ||
      (item.note   && item.note.toLowerCase().includes(keyword)) ||
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
    name:     document.getElementById('newName').value.trim(),
    category: document.getElementById('newCategory').value.trim(),
    date:     document.getElementById('newDate').value,
    status:   document.getElementById('newStatus').value.trim(),
    note:     document.getElementById('newNote').value.trim(),
    image:    document.getElementById('newImage').value.trim() || 'https://via.placeholder.com/80'
  };

  data.push(newItem);
  localStorage.setItem('inventoryData', JSON.stringify(data));

  addForm.reset();
  initFilters();
  renderTable(data);
});

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'inventory_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
window.exportData = exportData;

function updateData(index, key, value) {
  data[index][key] = value.trim();
  if (key === 'image') {
    const row = tableBody.children[index];
    const img = row?.querySelector('img');
    if (img) img.src = value.trim() || 'https://via.placeholder.com/80';
  }
  localStorage.setItem('inventoryData', JSON.stringify(data));
}
window.updateData = updateData;

function deleteSelectedRows() {
  const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
  if (!checkboxes.length) return alert('Chưa chọn dòng nào để xoá!');
  if (!confirm(`Xoá ${checkboxes.length} dòng đã chọn?`)) return;

  const indexes = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index, 10));
  indexes.sort((a, b) => b - a).forEach(i => data.splice(i, 1));

  localStorage.setItem('inventoryData', JSON.stringify(data));
  renderTable(data);
  initFilters();
}
window.deleteSelectedRows = deleteSelectedRows;

function handleImagePaste(e, index) {
  e.preventDefault();
  const link = (e.clipboardData || window.clipboardData).getData('text').trim();
  if (!link || !link.startsWith('http')) return;

  data[index].image = link;
  localStorage.setItem('inventoryData', JSON.stringify(data));
  renderTable(data);
}
window.handleImagePaste = handleImagePaste;

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
      renderTable(data);
      alert(`✅ Đã bổ sung ${addedCount} mục mới (bỏ qua mục trùng).`);

    } catch (err) {
      alert("File JSON không hợp lệ!");
    }
  };
  reader.readAsText(file);
}
window.importData = importData;
