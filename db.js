// ============================================================
//  Kinetic Creations — db.js  (Firebase Firestore)
// ============================================================

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc,
         collection, getDocs, addDoc, deleteDoc,
         updateDoc, onSnapshot }
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAKPsAAmM2q9QwkpunpPCROxRJNm-w8aR8",
  authDomain:        "kinetic-creations.firebaseapp.com",
  projectId:         "kinetic-creations",
  storageBucket:     "kinetic-creations.firebasestorage.app",
  messagingSenderId: "71084967180",
  appId:             "1:71084967180:web:0ecebe79097f1af0163529"
};

const _app = initializeApp(firebaseConfig);
const _db  = getFirestore(_app);

// ── Helpers ───────────────────────────────────────────────────────────────
async function _getDoc(col, id) {
  const snap = await getDoc(doc(_db, col, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
async function _getCol(col) {
  const snap = await getDocs(collection(_db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function _setDoc(col, id, data) {
  await setDoc(doc(_db, col, id), data, { merge: true });
}
async function _addDoc(col, data) {
  const ref = await addDoc(collection(_db, col), data);
  return ref.id;
}
async function _delDoc(col, id) {
  await deleteDoc(doc(_db, col, id));
}
async function _updDoc(col, id, patch) {
  await updateDoc(doc(_db, col, id), patch);
}

// ── KC ────────────────────────────────────────────────────────────────────
const KC = {

  MASTER: {
    adminId:      'kc_master_admin',    adminPass:    'KineticMaster@2026',
    designerId:   'kc_master_designer', designerPass: 'KineticMaster@2026'
  },

  _special: null,

  async getSpecial() {
    if (this._special) return this._special;
    const d = await _getDoc('settings', 'special');
    if (d) { this._special = d; return d; }
    const def = {
      admin:    { id:'admin',    username:'admin',    password:'Admin@123',  role:'admin',    name:'Admin' },
      designer: { id:'designer', username:'designer', password:'Design@456', role:'designer', name:'Designer' }
    };
    await _setDoc('settings', 'special', def);
    this._special = def;
    return def;
  },

  async saveSpecial(s)           { this._special = s; await _setDoc('settings', 'special', s); },

  async checkSpecial(ident, pass) {
    const s = await this.getSpecial();
    if ((ident===this.MASTER.adminId    ||ident==='master_admin')    &&pass===this.MASTER.adminPass)    return {...s.admin,    name:'Admin (Master)'};
    if ((ident===this.MASTER.designerId ||ident==='master_designer') &&pass===this.MASTER.designerPass) return {...s.designer, name:'Designer (Master)'};
    if ((ident===s.admin.username    ||ident===s.admin.id)    &&pass===s.admin.password)    return s.admin;
    if ((ident===s.designer.username ||ident===s.designer.id) &&pass===s.designer.password) return s.designer;
    return null;
  },

  async updateSpecial(role, patch) {
    const s = await this.getSpecial();
    s[role] = {...s[role], ...patch};
    await this.saveSpecial(s);
  },

  // ── Users ────────────────────────────────────────────────────────────
  async getUsers()    { return await _getCol('users'); },

  async addUser(data) {
    const users = await this.getUsers();
    if (users.find(u=>u.email===data.email))     return {ok:false, msg:'Email already registered.'};
    if (users.find(u=>u.username===data.username)) return {ok:false, msg:'Username already taken.'};
    const user = {...data, createdAt: new Date().toISOString()};
    const id   = await _addDoc('users', user);
    return {ok:true, user:{id,...user}};
  },

  async findUser(ident, pass) {
    const users = await this.getUsers();
    return users.find(u=>(u.email===ident||u.username===ident)&&u.password===pass)||null;
  },

  async updateUser(id, patch)  { await _updDoc('users', id, patch); return true; },
  async getUserById(id)        { return await _getDoc('users', id); },
  async saveUsers(arr)         { /* individual ops used instead */ },

  // ── Messages ─────────────────────────────────────────────────────────
  async getMessages() { return await _getCol('messages'); },

  async sendMessage(from, to, text) {
    const msg = {from, to, text, ts: new Date().toISOString(), read: false};
    const id  = await _addDoc('messages', msg);
    return {id, ...msg};
  },

  async getConversation(a, b) {
    const msgs = await this.getMessages();
    return msgs.filter(m=>(m.from===a&&m.to===b)||(m.from===b&&m.to===a))
               .sort((x,y)=>x.ts.localeCompare(y.ts));
  },

  async markRead(from, to) {
    const msgs = await this.getMessages();
    const unread = msgs.filter(m=>m.from===from&&m.to===to&&!m.read);
    await Promise.all(unread.map(m=>_updDoc('messages', m.id, {read:true})));
  },

  // ── Designs ──────────────────────────────────────────────────────────
  async getDesigns()     { return await _getCol('designs'); },
  async addDesign(d)     { const id=await _addDoc('designs',{...d,addedAt:new Date().toISOString()}); return {id,...d}; },
  async removeDesign(id) { await _delDoc('designs', id); },
  async saveDesigns()    { /* individual ops */ },

  // ── Members ──────────────────────────────────────────────────────────
  async getMembers()            { return await _getCol('members'); },
  async addMember(m)            { const id=await _addDoc('members',m); return {id,...m}; },
  async removeMember(id)        { await _delDoc('members', id); },
  async updateMember(id, patch) { await _updDoc('members', id, patch); return true; },
  async saveMembers()           { /* individual ops */ },

  // ── Clients ──────────────────────────────────────────────────────────
  async getClients()     { return await _getCol('clients'); },
  async addClient(cl)    { const id=await _addDoc('clients',cl); return {id,...cl}; },
  async removeClient(id) { await _delDoc('clients', id); },
  async saveClients()    { /* individual ops */ },

  async getClientsShowName() {
    const d = await _getDoc('settings','clients_showname');
    return d ? d.value : true;
  },
  async setClientsShowName(v) { await _setDoc('settings','clients_showname',{value:v}); },

  // ── Contact ──────────────────────────────────────────────────────────
  async getContact() {
    const d = await _getDoc('settings','contact');
    return d || {phone:'+977 9820758238',whatsapp:'+977 9820758238',facebook:'Kinetic Creations',email:''};
  },
  async saveContact(c) { await _setDoc('settings','contact',c); },

  // ── Session (local only) ─────────────────────────────────────────────
  setSession(u)  { sessionStorage.setItem('kc_session',JSON.stringify(u)); },
  getSession()   { try{return JSON.parse(sessionStorage.getItem('kc_session'));}catch{return null;} },
  clearSession() { sessionStorage.removeItem('kc_session'); },

  // ── OTP (in-memory) ──────────────────────────────────────────────────
  _otps:{},
  generateOTP(email) {
    const otp=String(Math.floor(100000+Math.random()*900000));
    this._otps[email]={otp,exp:Date.now()+5*60000}; return otp;
  },
  verifyOTP(email,otp) {
    const r=this._otps[email]; if(!r)return false;
    if(Date.now()>r.exp){delete this._otps[email];return false;}
    if(r.otp===String(otp)){delete this._otps[email];return true;} return false;
  },

  // ── Real-time listeners ──────────────────────────────────────────────
  onMessages(cb) {
    return onSnapshot(collection(_db,'messages'), snap=>{
      cb(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.ts.localeCompare(b.ts)));
    });
  },
  onClients(cb)  {
    return onSnapshot(collection(_db,'clients'),  snap=>{ cb(snap.docs.map(d=>({id:d.id,...d.data()}))); });
  },
  onMembers(cb)  {
    return onSnapshot(collection(_db,'members'),  snap=>{ cb(snap.docs.map(d=>({id:d.id,...d.data()}))); });
  },

  // ── Seed ─────────────────────────────────────────────────────────────
  async seed() {
    const members = await this.getMembers();
    if (!members.length) {
      await _setDoc('members','m1',{
        id:'m1', name:'Arjun Karki', role:'Owner & Lead Designer',
        skills:['Adobe Photoshop','Illustrator','Logo Design','Brand Identity'],
        photo:'images/about/owner.jpg'
      });
    }
  }
};

KC.seed().catch(console.error);
window.KC = KC;
export { KC };
