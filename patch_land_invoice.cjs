const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldCode = `                const baseInfo = {
                    '戶別': \`\${u.f}\${u.u}\`,
                    '收款日期': renderDateIfApplicable(dateKey, r[dateKey])
                };

                if (splitPrepay > 0) {
                    exportData.push({
                        ...baseInfo,
                        '金額': splitPrepay,
                        '備註 (發票號碼)': '預收',
                        '發票號碼': '預收 (免開立)'
                    });
                }
                if (amt > 0) {
                    exportData.push({
                        ...baseInfo,
                        '金額': amt,
                        '備註 (發票號碼)': invNum || '',
                        '發票號碼': invNum || ''
                    });
                }`;

const newCode = `                const preOpenInvoices = details.基本資料?.預開發票清單 || [];
                const isLand = invNum && preOpenInvoices.some(inv => String(inv.號碼).trim().toUpperCase() === invNum && inv.土地款);
                const invNumDisplay = invNum ? (isLand ? \`\${invNum} (土地款)\` : invNum) : '';

                const baseInfo = {
                    '戶別': \`\${u.f}\${u.u}\`,
                    '收款日期': renderDateIfApplicable(dateKey, r[dateKey])
                };

                if (splitPrepay > 0) {
                    exportData.push({
                        ...baseInfo,
                        '金額': splitPrepay,
                        '發票號碼': '預收 (免開立)'
                    });
                }
                if (amt > 0) {
                    exportData.push({
                        ...baseInfo,
                        '金額': amt,
                        '發票號碼': invNumDisplay
                    });
                }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('index.html', code);
