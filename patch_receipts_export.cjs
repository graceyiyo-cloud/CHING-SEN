const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const newExportFunc = `      const exportReceiptsToExcel = () => {
        const exportData = [];
        
        // Loop through all units and their receipts
        const seen = new Set();
        const allUnits = [];
        combinedData.forEach(row => {
            const uInfo = parseUnitInfo(row); const key = \`\${uInfo.f}_\${uInfo.u}\`;
            if (key !== "_" && !seen.has(key) && !uInfo.f.includes('合計')) { seen.add(key); allUnits.push(uInfo); }
        });

        allUnits.forEach(u => {
            const details = getUnitFullDetails(u.f, u.u, u.b);
            const records = details.匯款紀錄 || [];
            
            records.forEach(r => {
                const rK = r._id;
                const cD = firebaseInvoices[rK] || {};
                const invNum = String(cD['發票號碼'] || r['發票號碼'] || '').trim().toUpperCase();
                const invDate = cD['發票日期'] !== undefined ? cD['發票日期'] : renderDateIfApplicable('發票日期', r['發票日期']);
                const amtKey = Object.keys(r).find(k=>k.includes('金額'))||'金額';
                const dateKey = Object.keys(r).find(k=>k.includes('日期'))||'日期';
                
                exportData.push({
                    '戶別': \`\${u.f}\${u.u}\`,
                    '收款日期': renderDateIfApplicable(dateKey, r[dateKey]),
                    '金額': parseFloat(String(r[amtKey]).replace(/,/g,'')) || 0,
                    '發票號碼': invNum || ''
                });
            });
        });

        if (exportData.length === 0) {
            alert('沒有收款明細可匯出');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "收款明細");
        XLSX.writeFile(wb, \`收款明細_\${new Date().toLocaleDateString().replace(/\\//g, '')}.xlsx\`);
      };

`;

code = code.replace('      const exportSelectedStagesToExcel = () => {', newExportFunc + '      const exportSelectedStagesToExcel = () => {');
fs.writeFileSync('index.html', code);
