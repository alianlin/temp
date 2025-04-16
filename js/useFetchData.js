// js/useFetchData.js
import { ref, onMounted, watch } from 'https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.esm-browser.prod.js';

export function useFetchData() {
  const categories = ref([]);
  const currentCategory = ref('');
  const projects = ref([]);
  const path = ref('');

  const apiKey = 'AIzaSyB4qtRfCPfBRvf8l5mzJX1LZgmfzePn_-U';
  const sheetId = '1S7IYPAAL0suIzeJMpxlQODDVaYYvgsRBbR0p4Virqu0';
  const range = 'design!A1:Z'; // ✅ 從 A1 開始，包含表頭

  const fetchData = async () => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const values = data.values;

      const headers = values[0]; // 第一列是欄位名稱
      const rows = values.slice(1); // 從第二列開始才是資料

      const parsed = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => {
          obj[key] = row[i] || '';
        });

        // 處理 responsibilities 欄位
        obj.responsibilities = obj.responsibilities?.split('、') || [];
        return obj;
      });

      const uniqueCategories = [...new Set(parsed.map((p) => p.category))];
      projects.value = parsed;
      categories.value = uniqueCategories;
      currentCategory.value = uniqueCategories[0] || '';
    } catch (err) {
      console.error('🚨 Google Sheets API error:', err);
    }
  };

  onMounted(fetchData);

  watch(currentCategory, (newCat) => {
    const found = projects.value.find((p) => p.category === newCat);
    path.value = found?.path || '';
  });

  return {
    categories,
    currentCategory,
    projects,
    path,
  };
}
