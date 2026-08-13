const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldHandlers = `      const handleInvoiceChange = async (rK, field, val) => {
        if (!isAdmin) return;
        let finalVal = val; if (field === '發票日期') finalVal = convertToMinguo(val);
        const updated = { ...firebaseInvoices, [rK]: { ...(firebaseInvoices[rK] || {}), [field]: finalVal } };
        setFirebaseInvoices(updated);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invoices', 'all_invoices'), updated);
      };

      const handleInvoiceApplyPreOpen = async (rK, dateVal, numVal) => {
        if (!isAdmin) return;
        const dVal = convertToMinguo(dateVal || '');
        const updated = { 
            ...firebaseInvoices, 
            [rK]: { ...(firebaseInvoices[rK] || {}), '發票日期': dVal, '發票號碼': numVal || '' } 
        };
        setFirebaseInvoices(updated);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invoices', 'all_invoices'), updated);
      };`;

const newHandlers = `      const validateInvoiceAmount = (proposedInvoices, targetNum) => {
          if (!selectedUnit || !selectedUnit.基本資料?.預開發票清單) return true;
          const num = String(targetNum).trim().toUpperCase();
          if (!num) return true;
          const inv = selectedUnit.基本資料.預開發票清單.find(x => String(x.號碼).trim().toUpperCase() === num);
          if (!inv) return true;
          
          const targetAmt = parseFloat(String(inv.金額 || '').replace(/,/g, '')) || 0;
          if (targetAmt <= 0) return true;

          const records = selectedUnit.匯款紀錄 || [];
          let newTotal = 0;
          records.forEach(r => {
            const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
            const splitPrepay = prepayAllocationsMap[r._id] || 0;
            const amt = rawAmt - splitPrepay;
            
            const cD = proposedInvoices[r._id] || {};
            const invNum = String(cD['發票號碼'] || r['發票號碼'] || '').trim().toUpperCase();
            if (invNum === num && amt > 0) {
              newTotal += amt;
            }
          });

          if (newTotal > targetAmt) {
              alert(\`提示：發票號碼 \${num} 沖帳總金額 (\${newTotal.toLocaleString()}) 將會超過發票開立金額 (\${targetAmt.toLocaleString()})，請重新確認金額或發票號碼！\`);
              return false;
          }
          return true;
      };

      const handleInvoiceChange = async (rK, field, val) => {
        if (!isAdmin) return;
        let finalVal = val; if (field === '發票日期') finalVal = convertToMinguo(val);
        const updated = { ...firebaseInvoices, [rK]: { ...(firebaseInvoices[rK] || {}), [field]: finalVal } };
        
        if (field === '發票號碼' && !validateInvoiceAmount(updated, finalVal)) {
            return;
        }

        setFirebaseInvoices(updated);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invoices', 'all_invoices'), updated);
      };

      const handleInvoiceApplyPreOpen = async (rK, dateVal, numVal) => {
        if (!isAdmin) return;
        const dVal = convertToMinguo(dateVal || '');
        const updated = { 
            ...firebaseInvoices, 
            [rK]: { ...(firebaseInvoices[rK] || {}), '發票日期': dVal, '發票號碼': numVal || '' } 
        };
        
        if (numVal && !validateInvoiceAmount(updated, numVal)) {
            return;
        }

        setFirebaseInvoices(updated);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invoices', 'all_invoices'), updated);
      };`;

if (code.includes(oldHandlers)) {
    code = code.replace(oldHandlers, newHandlers);
} else {
    console.log("NOT FOUND");
}
fs.writeFileSync('index.html', code);
