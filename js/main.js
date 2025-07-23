const savedData = localStorage.getItem('inventoryData');
if (savedData) {
  data = JSON.parse(savedData);
}



const tableBody = document.querySelector('#itemTable tbody');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${item.image}" alt="img"></td>
      <td contenteditable="true" oninput="updateData(${index}, 'name', this.innerText)">${item.name}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'category', this.innerText)">${item.category}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'date', this.innerText)">${item.date}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'status', this.innerText)">${item.status}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'note', this.innerText)">${item.note}</td>
      <td contenteditable="true" oninput="updateData(${index}, 'qr', this.innerText)">
        <a href="${item.qr}" target="_blank">🔗 QR</a>
      </td>
    `;
    tableBody.appendChild(row);
  });
}


function updateFilter() {
  const category = categoryFilter.value;
  const keyword = searchInput.value.toLowerCase();
  const filtered = data.filter(item => {
    const matchCategory = !category || item.category === category;
    const matchKeyword = item.name.toLowerCase().includes(keyword) || item.note.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
  renderTable(filtered);
}

function initFilters() {
  const categories = [...new Set(data.map(item => item.category))];
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

const addForm = document.getElementById('addForm');

addForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const newItem = {
    name: document.getElementById('newName').value,
    category: document.getElementById('newCategory').value,
    date: document.getElementById('newDate').value,
    status: document.getElementById('newStatus').value,
    note: document.getElementById('newNote').value,
    image: document.getElementById('newImage').value || 'https://via.placeholder.com/80',
    qr: document.getElementById('newQR').value || '#'
  };

  data.push(newItem);
  renderTable(data);
// 1. Xuất dữ liệu ra JSON
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

// 2. Xoá toàn bộ dữ liệu
function clearData() {
  if (confirm('Bạn chắc chắn muốn xoá toàn bộ dữ liệu?')) {
    localStorage.removeItem('inventoryData');
    data = [];
    renderTable(data);
    initFilters(); // làm mới dropdown
  }
}

// 3. Reset về dữ liệu mặc định từ items.js
function resetToDefault() {
  if (confirm('Khôi phục dữ liệu mặc định? (Toàn bộ dữ liệu hiện tại sẽ bị mất)')) {
    localStorage.removeItem('inventoryData');
    location.reload(); // sẽ nạp lại từ file items.js ban đầu
  }
}

  
  initFilters(); // để cập nhật thêm category mới vào select

  addForm.reset(); // reset form
});

function updateData(index, key, value) {
  data[index][key] = value;
  localStorage.setItem('inventoryData', JSON.stringify(data));
}
