/* main.js
 * Quản Lý Tài Sản Cá Nhân - Aurora
 * Bản gọn ổn định: paste link ảnh -> chỉ hiện ảnh, không hiện chữ.
 */

/* --- LOAD DỮ LIỆU --- */
let data = Array.isArray(window.data) ? [...window.data] : [];

const savedData = localStorage.getItem('inventoryData');
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    if (Array.isArray(parsed)) data = parsed;
  } catch (_) {}
}

/* --- DOM references --- */
const tableBody      = document.querySelector('#itemTable tbody');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput    = document.getElementById('searchInput');
const addForm        = document.getElementById('addForm');

/* --- RENDER BẢNG --- */
function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td onpaste="handleImagePaste(event, ${index})" style="padding:0; cursor:pointer;">
        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="img" style="display:block; max-height:60px;">
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

/* --- ESCAPE HTML --- */
function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* --- FILTER --- */
function updateFilter() {
  const category = categoryFilter.value;
  const keyword = searchInput.value.trim().toLowerCase();

  const filtered = data.filter(item => {
    const matchCategory = !category || item.category === category;
    const matchKeyword =
      !keyword ||
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

/* --- KHỞI TẠO --- */
initFilters();
renderTable(data);

/* --- THÊM MỚI --- */
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

/* --- CẬP NHẬT INLINE --- */
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

/* --- XUẤT JSON --- */
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

/* --- NHẬP JSON --- */
function importData() {
  const fileInput = document.getElementById('importJsonInput');
  const file = fileInput.files[0];
  if (!file) return alert('Vui lòng chọn một file JSON!');

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const newData = JSON.parse(e.target.result);
      if (!Array.isArray(newData)) throw new Error();

      if (confirm("Bạn có chắc muốn ghi đè toàn bộ dữ liệu hiện tại?")) {
        data = newData;
        localStorage.setItem('inventoryData', JSON.stringify(data));
        initFilters();
        renderTable(data);
        alert("Đã nhập JSON thành công!");
      }
    } catch (err) {
      alert("File JSON không hợp lệ!");
    }
  };
  reader.readAsText(file);
}
window.importData = importData;

/* --- XOÁ THEO CHỈ MỤC --- */
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
    renderTable(data);
  }
}
window.deleteByRowIndex = deleteByRowIndex;

/* --- PASTE LINK ẢNH --- */
function handleImagePaste(e, index) {
  e.preventDefault();
  const link = (e.clipboardData || window.clipboardData).getData('text').trim();
  if (!link || !link.startsWith('http')) return;

  data[index].image = link;
  localStorage.setItem('inventoryData', JSON.stringify(data));
  renderTable(data);
}
window.handleImagePaste = handleImagePaste;
