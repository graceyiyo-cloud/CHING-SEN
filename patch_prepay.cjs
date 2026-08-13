const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetStr = `      // 預開發票已收款項金額計算 (依照原本的提撥預收款規則計算淨值後加總)
      const preOpenReceivedMap = useMemo(() => {
        if (!selectedUnit) return {};
        const map = {};
        
        const prepayAmount = parseFloat(String(selectedUnit.基本資料?.預收款).replace(/,/g, '')) || 0;
        const houseForExp = selectedUnit.財務款項?.house || {}; 
        const landForExp = selectedUnit.財務款項?.land || {};
        const chargesForExp = Math.max(0, (selectedUnit.客變紀錄 || []).reduce((s,r) => s + (Number(r.客變金額)||0), 0));
        
        let expBeforeShiZhao = chargesForExp;
        PAYMENT_STAGES.forEach(st => {
            if (['客變', '使照', '銀貸', '交屋'].includes(st.k)) return;
            const kMatchH = Object.keys(houseForExp).find(x=>x.includes(st.k) && !x.includes('總價'));
            const kMatchL = Object.keys(landForExp).find(x=>x.includes(st.k) && !x.includes('總價'));
            expBeforeShiZhao += (kMatchH ? (parseFloat(String(houseForExp[kMatchH]).replace(/,/g,''))||0) : 0);
            expBeforeShiZhao += (kMatchL ? (parseFloat(String(landForExp[kMatchL]).replace(/,/g,''))||0) : 0);
        });

        const records = selectedUnit.匯款紀錄 || [];
        const totalReceipts = records.reduce((s,r) => s + (parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0), 0);
        
        const isPrioritizePrepay = selectedUnit.基本資料?.優先預收;
        const canPrioritizePrepay = isPrioritizePrepay && (totalReceipts >= expBeforeShiZhao + prepayAmount);

        let prepayAllocations = {}; 
        let unallocated = prepayAmount;

        if (canPrioritizePrepay) {
          let runningForMatch = 0;
          for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
            const previousRunning = runningForMatch;
            runningForMatch += rawAmt;
            if (unallocated > 0 && previousRunning >= expBeforeShiZhao && rawAmt === unallocated) {
              prepayAllocations[r._id] = unallocated;
              unallocated = 0;
              break; 
            }
          }
        
          let running = 0;
          for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
            running += rawAmt;
            if (unallocated > 0 && running > expBeforeShiZhao && !prepayAllocations[r._id]) {
              const available = Math.min(rawAmt, running - expBeforeShiZhao);
              const allocate = Math.min(unallocated, available);
              prepayAllocations[r._id] = allocate;
              unallocated -= allocate;
            }
          }
        } else {
          let expBeforePrepayNormal = expBeforeShiZhao;
          const kMatchH = Object.keys(houseForExp).find(x=>x.includes('使照') && !x.includes('總價'));
          const kMatchL = Object.keys(landForExp).find(x=>x.includes('使照') && !x.includes('總價'));
          expBeforePrepayNormal += (kMatchH ? (parseFloat(String(houseForExp[kMatchH]).replace(/,/g,''))||0) : 0);
          expBeforePrepayNormal += (kMatchL ? (parseFloat(String(landForExp[kMatchL]).replace(/,/g,''))||0) : 0);

          let running = 0;
          for (let i = 0; i < records.length; i++) {
              const r = records[i];
              const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
              running += rawAmt;
              if (unallocated > 0 && running > expBeforePrepayNormal) {
                  const available = Math.min(rawAmt, running - expBeforePrepayNormal);
                  const allocate = Math.min(unallocated, available);
                  prepayAllocations[r._id] = allocate;
                  unallocated -= allocate;
              }
          }
        }

        records.forEach(r => {
          const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
          const splitPrepay = prepayAllocations[r._id] || 0;
          const amt = rawAmt - splitPrepay; // 發票實算沖銷額
          
          const rK = r._id;
          const cD = firebaseInvoices[rK] || {};
          const invNum = String(cD['發票號碼'] || r['發票號碼'] || '').trim().toUpperCase();
          if (invNum && amt > 0) {
            map[invNum] = (map[invNum] || 0) + amt;
          }
        });

        return map;
      }, [selectedUnit, firebaseInvoices]);`;

const repStr = `      const prepayAllocationsMap = useMemo(() => {
        if (!selectedUnit) return {};
        const prepayAmount = parseFloat(String(selectedUnit.基本資料?.預收款).replace(/,/g, '')) || 0;
        const houseForExp = selectedUnit.財務款項?.house || {}; 
        const landForExp = selectedUnit.財務款項?.land || {};
        const chargesForExp = Math.max(0, (selectedUnit.客變紀錄 || []).reduce((s,r) => s + (Number(r.客變金額)||0), 0));
        
        let expBeforeShiZhao = chargesForExp;
        PAYMENT_STAGES.forEach(st => {
            if (['客變', '使照', '銀貸', '交屋'].includes(st.k)) return;
            const kMatchH = Object.keys(houseForExp).find(x=>x.includes(st.k) && !x.includes('總價'));
            const kMatchL = Object.keys(landForExp).find(x=>x.includes(st.k) && !x.includes('總價'));
            expBeforeShiZhao += (kMatchH ? (parseFloat(String(houseForExp[kMatchH]).replace(/,/g,''))||0) : 0);
            expBeforeShiZhao += (kMatchL ? (parseFloat(String(landForExp[kMatchL]).replace(/,/g,''))||0) : 0);
        });

        const records = selectedUnit.匯款紀錄 || [];
        const totalReceipts = records.reduce((s,r) => s + (parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0), 0);
        
        const isPrioritizePrepay = selectedUnit.基本資料?.優先預收;
        const canPrioritizePrepay = isPrioritizePrepay && (totalReceipts >= expBeforeShiZhao + prepayAmount);

        let prepayAllocations = {}; 
        let unallocated = prepayAmount;

        if (canPrioritizePrepay) {
          let runningForMatch = 0;
          for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
            const previousRunning = runningForMatch;
            runningForMatch += rawAmt;
            if (unallocated > 0 && previousRunning >= expBeforeShiZhao && rawAmt === unallocated) {
              prepayAllocations[r._id] = unallocated;
              unallocated = 0;
              break; 
            }
          }
        
          let running = 0;
          for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
            running += rawAmt;
            if (unallocated > 0 && running > expBeforeShiZhao && !prepayAllocations[r._id]) {
              const available = Math.min(rawAmt, running - expBeforeShiZhao);
              const allocate = Math.min(unallocated, available);
              prepayAllocations[r._id] = allocate;
              unallocated -= allocate;
            }
          }
        } else {
          let expBeforePrepayNormal = expBeforeShiZhao;
          const kMatchH = Object.keys(houseForExp).find(x=>x.includes('使照') && !x.includes('總價'));
          const kMatchL = Object.keys(landForExp).find(x=>x.includes('使照') && !x.includes('總價'));
          expBeforePrepayNormal += (kMatchH ? (parseFloat(String(houseForExp[kMatchH]).replace(/,/g,''))||0) : 0);
          expBeforePrepayNormal += (kMatchL ? (parseFloat(String(landForExp[kMatchL]).replace(/,/g,''))||0) : 0);

          let running = 0;
          for (let i = 0; i < records.length; i++) {
              const r = records[i];
              const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
              running += rawAmt;
              if (unallocated > 0 && running > expBeforePrepayNormal) {
                  const available = Math.min(rawAmt, running - expBeforePrepayNormal);
                  const allocate = Math.min(unallocated, available);
                  prepayAllocations[r._id] = allocate;
                  unallocated -= allocate;
              }
          }
        }
        return prepayAllocations;
      }, [selectedUnit]);

      // 預開發票已收款項金額計算 (依照原本的提撥預收款規則計算淨值後加總)
      const preOpenReceivedMap = useMemo(() => {
        if (!selectedUnit) return {};
        const map = {};
        
        const records = selectedUnit.匯款紀錄 || [];
        records.forEach(r => {
          const rawAmt = parseFloat(String(r[Object.keys(r).find(k=>k.includes('金額'))||'金額']).replace(/,/g,''))||0;
          const splitPrepay = prepayAllocationsMap[r._id] || 0;
          const amt = rawAmt - splitPrepay; // 發票實算沖銷額
          
          const rK = r._id;
          const cD = firebaseInvoices[rK] || {};
          const invNum = String(cD['發票號碼'] || r['發票號碼'] || '').trim().toUpperCase();
          if (invNum && amt > 0) {
            map[invNum] = (map[invNum] || 0) + amt;
          }
        });

        return map;
      }, [selectedUnit, firebaseInvoices, prepayAllocationsMap]);`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, repStr);
} else {
    console.log('NOT FOUND');
}
fs.writeFileSync('index.html', code);
