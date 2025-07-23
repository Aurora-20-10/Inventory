let data = []; 

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
 <td>
  <img src="${item.image}" alt="img" style="display:block; margin-bottom: 4px;">
  <div contenteditable="true"
       class="image-link-editor"
       oninput="updateData(${index}, 'image', this.innerText)"
       onblur="this.style.display='none'">
    ${item.image}
  </div>
</td>
  <div contenteditable="true" oninput="updateData(${index}, 'image', this.innerText)">
    ${item.image}
  </div>
</td>

  <td contenteditable="true" oninput="updateData(${index}, 'name', this.innerText)">${item.name}</td>
  <td contenteditable="true" oninput="updateData(${index}, 'category', this.innerText)">${item.category}</td>
  <td contenteditable="true" oninput="updateData(${index}, 'date', this.innerText)">${item.date}</td>
  <td contenteditable="true" oninput="updateData(${index}, 'status', this.innerText)">${item.status}</td>
  <td contenteditable="true" oninput="updateData(${index}, 'note', this.innerText)">${item.note}</td>
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
  localStorage.setItem('inventoryData', JSON.stringify(data));
  renderTable(data);
  
  initFilters(); // để cập nhật thêm category mới vào select

  addForm.reset(); // reset form
});

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


function updateData(index, key, value) {
  data[index][key] = value;
  localStorage.setItem('inventoryData', JSON.stringify(data));
  
  // ✅ Nếu người dùng sửa link ảnh, thì render lại bảng để ảnh cập nhật
  if (key === 'image') {
    renderTable(data);
  }
}

function deleteByRowIndex() {
  const input = document.getElementById('rowIndexInput');
  const index = parseInt(input.value) - 1; // Vì người nhập từ 1, mảng từ 0

  if (isNaN(index) || index < 0 || index >= data.length) {
    alert('Số dòng không hợp lệ!');
    return;
  }

  if (confirm(`Xoá dòng số ${index + 1}?`)) {
    data.splice(index, 1);
    localStorage.setItem('inventoryData', JSON.stringify(data));
    renderTable(data);
    input.value = ''; // reset sau khi xoá
  }
}
