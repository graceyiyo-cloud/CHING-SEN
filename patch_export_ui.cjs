const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldHtml = `                  <div className="relative" ref={exportMenuRef}>
                      <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-white border border-sky-600 text-sky-600 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-sky-600 hover:text-white flex items-center gap-1 shadow-sm transition-all"><Download size={12} />匯出期款清單</button>
                      {showExportMenu && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                              <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 flex items-center gap-2"><CheckSquare size={14} className="text-sky-600"/><span className="text-xs font-bold text-sky-800">勾選欲匯出的期款</span></div>
                              <div className="max-h-60 overflow-y-auto p-2">
                                  {PAYMENT_STAGES.map(st => (
                                      <label key={st.k} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                          <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500" checked={selectedExportStages.includes(st.k)} onChange={() => toggleExportStage(st.k)} />
                                          <span className="text-xs text-gray-700">{st.l}</span>
                                      </label>
                                  ))}
                              </div>
                              <div className="p-2 border-t bg-gray-50"><button onClick={exportSelectedStagesToExcel} disabled={selectedExportStages.length === 0} className={\`w-full py-1.5 rounded text-xs font-bold transition-all shadow-sm \${selectedExportStages.length > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}\`}>匯出勾選項目</button></div>
                          </div>
                      )}
                  </div>
                  <button onClick={handleExportSystemExcel} className="bg-white border border-emerald-600 text-emerald-600 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-emerald-600 hover:text-white flex items-center gap-1 shadow-sm transition-all"><Download size={12} />匯出系統資料</button>`;

const newHtml = `                  <div className="relative" ref={exportMenuRef}>
                      <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-white border border-sky-600 text-sky-600 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-sky-600 hover:text-white flex items-center gap-1 shadow-sm transition-all"><Download size={12} />匯出報表</button>
                      {showExportMenu && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                              <button onClick={() => { handleExportSystemExcel(); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 border-b text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Database size={14} className="text-emerald-600" />匯出系統資料</button>
                              <button onClick={() => { exportReceiptsToExcel(); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 border-b text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><ClipboardList size={14} className="text-amber-500" />匯出收款明細</button>
                              
                              <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 flex justify-between items-center"><div className="flex items-center gap-2"><CheckSquare size={14} className="text-sky-600"/><span className="text-[11px] font-bold text-sky-800">匯出指定期款</span></div><button onClick={() => { if(selectedExportStages.length === PAYMENT_STAGES.length) setSelectedExportStages([]); else setSelectedExportStages(PAYMENT_STAGES.map(s=>s.k)); }} className="text-[10px] text-sky-600 hover:underline">{selectedExportStages.length === PAYMENT_STAGES.length ? '全不選' : '全選'}</button></div>
                              <div className="max-h-48 overflow-y-auto p-2 border-b">
                                  {PAYMENT_STAGES.map(st => (
                                      <label key={st.k} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                          <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500" checked={selectedExportStages.includes(st.k)} onChange={() => toggleExportStage(st.k)} />
                                          <span className="text-xs text-gray-700">{st.l}</span>
                                      </label>
                                  ))}
                              </div>
                              <div className="p-2 bg-gray-50"><button onClick={exportSelectedStagesToExcel} disabled={selectedExportStages.length === 0} className={\`w-full py-1.5 rounded text-xs font-bold transition-all shadow-sm \${selectedExportStages.length > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}\`}>匯出已勾選期款</button></div>
                          </div>
                      )}
                  </div>`;

code = code.replace(oldHtml, newHtml);
fs.writeFileSync('index.html', code);
