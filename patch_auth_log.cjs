const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetState = `      const [customData, setCustomData] = useState({ units: {}, remittances: [], customChanges: [], deletedImportedRemittances: [], allowedViewers: [] });`;
const replaceState = targetState + `\n      const [loginLogs, setLoginLogs] = useState({});`;

const targetAuth = `        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) { setUser(u); setAuthError(""); } else { setUser(null); }
          setIsAuthLoading(false);
        });`;
const replaceAuth = `        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) { 
            setUser(u); setAuthError(""); 
            if (u.email && u.email !== ADMIN_EMAIL) {
                const emailKey = u.email.replace(/\\./g, '_');
                setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom', 'login_logs'), {
                    [emailKey]: {
                        email: u.email,
                        lastLogin: new Date().toISOString(),
                        name: u.displayName || ''
                    }
                }, { merge: true }).catch(console.error);
            }
          } else { setUser(null); }
          setIsAuthLoading(false);
        });`;

const targetSub = `        const unsubArchived = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'custom', 'archived'), (s) => {
            if (s.exists()) { setArchivedRemittances(s.data().remittances || []); } else { setArchivedRemittances([]); }
        });`;
const replaceSub = targetSub + `
        const unsubLogs = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'custom', 'login_logs'), (s) => {
            if (s.exists()) { setLoginLogs(s.data()); } else { setLoginLogs({}); }
        });`;

const targetUnsub = `        return () => { unsubInv(); unsubCustom(); unsubMaster(); unsubArchived(); };`;
const replaceUnsub = `        return () => { unsubInv(); unsubCustom(); unsubMaster(); unsubArchived(); unsubLogs(); };`;

code = code.replace(targetState, replaceState);
code = code.replace(targetAuth, replaceAuth);
code = code.replace(targetSub, replaceSub);
code = code.replace(targetUnsub, replaceUnsub);

fs.writeFileSync('index.html', code);
