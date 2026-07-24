const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetHtml = `                      {(customData.allowedViewers || []).map((v, i) => {
                          const name = typeof v === 'string' ? '未命名' : v.name;
                          const email = typeof v === 'string' ? v : v.email;
                          return (
                              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                                  <div className="flex flex-col">
                                      <span className="font-bold text-sm text-gray-700">{name}</span>
                                      <span className="text-xs text-gray-500">{email}</span>
                                  </div>
                                  <button onClick={async () => {`;

const replacementHtml = `                      {(customData.allowedViewers || []).map((v, i) => {
                          const name = typeof v === 'string' ? '未命名' : v.name;
                          const email = typeof v === 'string' ? v : v.email;
                          const log = loginLogs[email.replace(/\\./g, '_')];
                          const lastLoginStr = log?.lastLogin ? new Date(log.lastLogin).toLocaleString() : '尚未登入';
                          return (
                              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                                  <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm text-gray-700">{name}</span>
                                          <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">最後登入: {lastLoginStr}</span>
                                      </div>
                                      <span className="text-xs text-gray-500">{email}</span>
                                  </div>
                                  <button onClick={async () => {`;

code = code.replace(targetHtml, replacementHtml);
fs.writeFileSync('index.html', code);
