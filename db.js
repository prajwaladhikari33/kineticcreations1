// ============================================================
//  Kinetic Creations — db.js  (Firebase Compat SDK)
//  Loads via regular <script> tag — no ES modules needed
// ============================================================

// KC object — all methods are async, return Promises
const KC = {

  // ── Internal: wait for Firebase to be ready ──────────────────────────
  _db: null,
  _ready: false,
  _readyCallbacks: [],

  init(db) {
    this._db = db;
    this._ready = true;
    this._readyCallbacks.forEach(fn => fn());
    this._readyCallbacks = [];
  },

  _getDB() {
    return new Promise(resolve => {
      if (this._ready) return resolve(this._db);
      this._readyCallbacks.push(() => resolve(this._db));
    });
  },

  // ── Helpers ───────────────────────────────────────────────────────────
  async _col(name) {
    const db = await this._getDB();
    return db.collection(name);
  },

  async _getAll(colName) {
    const col = await this._col(colName);
    const snap = await col.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async _getOne(colName, id) {
    const db = await this._getDB();
    const snap = await db.collection(colName).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async _setOne(colName, id, data) {
    const db = await this._getDB();
    await db.collection(colName).doc(id).set(data, { merge: true });
  },

  async _addOne(colName, data) {
    const db = await this._getDB();
    const ref = await db.collection(colName).add(data);
    return ref.id;
  },

  async _delOne(colName, id) {
    const db = await this._getDB();
    await db.collection(colName).doc(id).delete();
  },

  async _updOne(colName, id, patch) {
    const db = await this._getDB();
    await db.collection(colName).doc(id).update(patch);
  },

  // ── Master credentials (hardcoded, never stored) ──────────────────────
  MASTER: {
    adminId:      'kc_master_admin',
    adminPass:    'KineticMaster@2026',
    designerId:   'kc_master_designer',
    designerPass: 'KineticMaster@2026'
  },

  // ── Special accounts (admin / designer) ───────────────────────────────
  _specialCache: null,

  async getSpecial() {
    if (this._specialCache) return this._specialCache;
    const d = await this._getOne('settings', 'special');
    if (d) { delete d.id; this._specialCache = d; return d; }
    const def = {
      admin:    { id:'admin',    username:'admin',    password:'Admin@123',  role:'admin',    name:'Admin' },
      designer: { id:'designer', username:'designer', password:'Design@456', role:'designer', name:'Designer' }
    };
    await this._setOne('settings', 'special', def);
    this._specialCache = def;
    return def;
  },

  async saveSpecial(s) {
    this._specialCache = s;
    await this._setOne('settings', 'special', s);
  },

  async checkSpecial(ident, pass) {
    const s = await this.getSpecial();
    if ((ident === this.MASTER.adminId    || ident === 'master_admin')    && pass === this.MASTER.adminPass)    return { ...s.admin,    name: 'Admin (Master)' };
    if ((ident === this.MASTER.designerId || ident === 'master_designer') && pass === this.MASTER.designerPass) return { ...s.designer, name: 'Designer (Master)' };
    if ((ident === s.admin.username    || ident === s.admin.id)    && pass === s.admin.password)    return s.admin;
    if ((ident === s.designer.username || ident === s.designer.id) && pass === s.designer.password) return s.designer;
    return null;
  },

  async updateSpecial(role, patch) {
    const s = await this.getSpecial();
    s[role] = { ...s[role], ...patch };
    await this.saveSpecial(s);
  },

  // ── Users ─────────────────────────────────────────────────────────────
  async getUsers()    { return await this._getAll('users'); },
  async getUserById(id) { return await this._getOne('users', id); },

  async addUser(data) {
    const users = await this.getUsers();
    if (users.find(u => u.email    === data.email))    return { ok: false, msg: 'Email already registered.' };
    if (users.find(u => u.username === data.username)) return { ok: false, msg: 'Username already taken.' };
    const user = { ...data, createdAt: new Date().toISOString() };
    const id   = await this._addOne('users', user);
    return { ok: true, user: { id, ...user } };
  },

  async findUser(ident, pass) {
    const users = await this.getUsers();
    return users.find(u => (u.email === ident || u.username === ident) && u.password === pass) || null;
  },

  async updateUser(id, patch) { await this._updOne('users', id, patch); return true; },

  async saveUsers(arr) {
    // For delete: handled by deleteUser directly
  },

  async deleteUser(id) { await this._delOne('users', id); },

  // ── Messages ──────────────────────────────────────────────────────────
  async getMessages() { return await this._getAll('messages'); },

  async sendMessage(from, to, text) {
    const msg = { from, to, text, ts: new Date().toISOString(), read: false };
    const id  = await this._addOne('messages', msg);
    return { id, ...msg };
  },

  async getConversation(a, b) {
    const msgs = await this.getMessages();
    return msgs
      .filter(m => (m.from === a && m.to === b) || (m.from === b && m.to === a))
      .sort((x, y) => x.ts.localeCompare(y.ts));
  },

  async markRead(from, to) {
    const msgs = await this.getMessages();
    const unread = msgs.filter(m => m.from === from && m.to === to && !m.read);
    await Promise.all(unread.map(m => this._updOne('messages', m.id, { read: true })));
  },

  // ── Designs ───────────────────────────────────────────────────────────
  async getDesigns()     { return await this._getAll('designs'); },
  async addDesign(d)     { const id = await this._addOne('designs', { ...d, addedAt: new Date().toISOString() }); return { id, ...d }; },
  async removeDesign(id) { await this._delOne('designs', id); },

  // ── Members ───────────────────────────────────────────────────────────
  async getMembers()            { return await this._getAll('members'); },
  async addMember(m)            { const id = await this._addOne('members', m); return { id, ...m }; },
  async removeMember(id)        { await this._delOne('members', id); },
  async updateMember(id, patch) { await this._updOne('members', id, patch); return true; },

  // ── Clients ───────────────────────────────────────────────────────────
  async getClients()     { return await this._getAll('clients'); },
  async addClient(cl)    { const id = await this._addOne('clients', cl); return { id, ...cl }; },
  async removeClient(id) { await this._delOne('clients', id); },

  async getClientsShowName() {
    const d = await this._getOne('settings', 'clients_showname');
    return d ? d.value : true;
  },
  async setClientsShowName(v) { await this._setOne('settings', 'clients_showname', { value: v }); },

  // ── Contact ───────────────────────────────────────────────────────────
  async getContact() {
    const d = await this._getOne('settings', 'contact');
    return d ? (delete d.id, d) : { phone: '+977 9820758238', whatsapp: '+977 9820758238', facebook: 'Kinetic Creations', email: '' };
  },
  async saveContact(c) { await this._setOne('settings', 'contact', c); },

  // ── Session (local, sync) ─────────────────────────────────────────────
  setSession(u)  { sessionStorage.setItem('kc_session', JSON.stringify(u)); },
  getSession()   { try { return JSON.parse(sessionStorage.getItem('kc_session')); } catch { return null; } },
  clearSession() { sessionStorage.removeItem('kc_session'); },

  // ── OTP (in-memory) ───────────────────────────────────────────────────
  _otps: {},
  generateOTP(email) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    this._otps[email] = { otp, exp: Date.now() + 5 * 60000 };
    return otp;
  },
  verifyOTP(email, otp) {
    const r = this._otps[email];
    if (!r) return false;
    if (Date.now() > r.exp) { delete this._otps[email]; return false; }
    if (r.otp === String(otp)) { delete this._otps[email]; return true; }
    return false;
  },

  // ── Real-time listeners ───────────────────────────────────────────────
  onMessages(cb) {
    return this._getDB().then(db => {
      return db.collection('messages').onSnapshot(snap => {
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.ts.localeCompare(b.ts)));
      });
    });
  },

  onClients(cb) {
    return this._getDB().then(db => {
      return db.collection('clients').onSnapshot(snap => {
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    });
  },

  // ── Seed default data ─────────────────────────────────────────────────
  async seed() {
    const members = await this.getMembers();
    if (!members.find(m => m.id === 'm1')) {
      await this._setOne('members', 'm1', {
        name: 'Arjun Karki', role: 'Owner & Lead Designer',
        skills: ['Adobe Photoshop', 'Illustrator', 'Logo Design', 'Brand Identity'],
        photo: 'images/about/owner.jpg'
      });
    }
  }
};
