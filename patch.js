const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldCode = `      const combinedData = useMemo(() => {
        let base = sheetsData[activeTab] ? [...sheetsData[activeTab]] : []; 
        if (customData?.units && activeTab.includes('收款總表')) {
          Object.keys(customData.units).forEach(key => {
            const cu = customData.units[key]; if (!cu?.基本資料) return;
            const f = normStr(cu.基本資料.樓層), u = normStr(cu.基本資料.編號);
            const exists = base.find(r => normStr(r['樓層']) === f && normStr(r['編號']) === u);
            if (!exists) base.push({ '樓層': cu.基本資料.樓層, '編號': cu.基本資料.編號, '買方': cu.基本資料.買方, '_isCustom': true });
            else if (cu.基本資料?.買方) exists['買方'] = cu.基本資料.買方;
          });
        }
        return base.filter(row => {`;

const newCode = `      const combinedData = useMemo(() => {
        if (!sheetsData[activeTab]) return [];
        let base = sheetsData[activeTab].map(r => ({ ...r })); 

        if (activeTab.includes('收款總表')) {
          const unitRows = {};
          base.forEach(row => {
             const f = normStr(row['樓層']), u = normStr(row['編號']);
             const key = \`\${f}_\${u}\`;
             if (!unitRows[key]) unitRows[key] = [];
             unitRows[key].push(row);
          });
          
          Object.keys(unitRows).forEach(key => {
             const rows = unitRows[key];
             let house = {}, land = {};
             
             rows.forEach(row => {
                 const isHouse = Object.values(row).some(v => String(v).includes('房屋'));
                 const isLand = Object.values(row).some(v => String(v).includes('土地'));
                 if (isHouse) house = row;
                 if (isLand) land = row;
             });
             
             // If neither matches clearly, just assume first row is house
             if (Object.keys(house).length === 0 && rows.length > 0) house = rows[0];

             const cu = customData?.units?.[key];
             if (cu) {
                rows.forEach(row => {
                   if (cu.基本資料?.買方) row['買方'] = cu.基本資料.買方;
                });
                
                if (cu.house && Object.keys(house).length > 0) {
                   Object.keys(cu.house).forEach(k => { house[k] = cu.house[k]; });
                }
                if (cu.land && Object.keys(land).length > 0) {
                   Object.keys(cu.land).forEach(k => { land[k] = cu.land[k]; });
                }
             }
             
             let totalHouse = 0, totalLand = 0;
             PAYMENT_STAGES.forEach(s => {
                  if (s.k === '客變') return;
                  if (Object.keys(house).length > 0) {
                      const hk = Object.keys(house).find(x=>x.includes(s.k) && !x.includes('總價'));
                      totalHouse += (hk ? (parseFloat(String(house[hk]).replace(/,/g,''))||0) : 0);
                  }
                  if (Object.keys(land).length > 0) {
                      const lk = Object.keys(land).find(x=>x.includes(s.k) && !x.includes('總價'));
                      totalLand += (lk ? (parseFloat(String(land[lk]).replace(/,/g,''))||0) : 0);
                  }
             });
             
             rows.forEach(row => {
                  const tk = Object.keys(row).find(x => x === '成交總價');
                  if (tk) {
                      row[tk] = totalHouse + totalLand;
                  }
             });
          });
          
          if (customData?.units) {
             Object.keys(customData.units).forEach(key => {
                const cu = customData.units[key]; if (!cu?.基本資料) return;
                if (!unitRows[key]) {
                   base.push({ '樓層': cu.基本資料.樓層, '編號': cu.基本資料.編號, '買方': cu.基本資料.買方, '_isCustom': true, ...(cu.house||{}), ...(cu.land||{}) });
                }
             });
          }
        }

        return base.filter(row => {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('index.html', code);
