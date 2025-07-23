const tableBody = document.querySelector('#itemTable tbody');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${item.image}" alt="img"></td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.date}</td>
      <td>${item.status}</td>
      <td>${item.note}</td>
      <td><a href="${item.qr}" target="_blank">🔗 QR</a></td>
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
