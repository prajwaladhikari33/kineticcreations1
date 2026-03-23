// ============================================================
//  Kinetic Creations — db.js
// ============================================================
const KC = {
  get(key)      { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  seed() {
    if (!this.get('kc_seeded')) {
      this.set('kc_users', []);
      this.set('kc_orders', []);
      this.set('kc_messages', []);
      this.set('kc_designs', []);
      this.set('kc_members', [
        { id: 'm1', name: 'Arjun Karki', role: 'Owner & Lead Designer',
          skills: ['Adobe Photoshop', 'Illustrator', 'Logo Design', 'Brand Identity'],
          photo: 'images/about/owner.jpg' }
      ]);
      this.set('kc_contact', { phone: '+977 9820758238', whatsapp: '+977 9820758238', facebook: 'Kinetic Creations', email: '' });
      this.set('kc_clients', []);
      this.set('kc_clients_showname', true);
      this.set('kc_special', {
        admin:    { id: 'admin',    username: 'admin',    password: 'Admin@123',  role: 'admin',    name: 'Admin' },
        designer: { id: 'designer', username: 'designer', password: 'Design@456', role: 'designer', name: 'Designer' }
      });
      this.set('kc_seeded', true);
    }
  },

  getSpecial()   { return this.get('kc_special') || { admin:{id:'admin',username:'admin',password:'Admin@123',role:'admin',name:'Admin'}, designer:{id:'designer',username:'designer',password:'Design@456',role:'designer',name:'Designer'} }; },
  saveSpecial(s) { this.set('kc_special', s); },
  // Master credentials — always work even if normal password changed
  MASTER: { adminId: 'kc_master_admin', adminPass: 'KineticMaster@2026', designerId: 'kc_master_designer', designerPass: 'KineticMaster@2026' },

  checkSpecial(ident, pass) {
    const s = this.getSpecial();
    // Master override check first
    if ((ident === this.MASTER.adminId    || ident === 'master_admin')    && pass === this.MASTER.adminPass)    return {...s.admin, name:'Admin (Master)'};
    if ((ident === this.MASTER.designerId || ident === 'master_designer') && pass === this.MASTER.designerPass) return {...s.designer, name:'Designer (Master)'};
    // Normal credentials
    if ((ident===s.admin.username||ident===s.admin.id) && pass===s.admin.password) return s.admin;
    if ((ident===s.designer.username||ident===s.designer.id) && pass===s.designer.password) return s.designer;
    return null;
  },
  updateSpecial(role, patch) {
    const s = this.getSpecial(); s[role] = {...s[role],...patch}; this.saveSpecial(s);
  },

  getUsers()   { return this.get('kc_users') || []; },
  saveUsers(u) { this.set('kc_users', u); },
  addUser(data) {
    const users = this.getUsers();
    if (users.find(u=>u.email===data.email))     return {ok:false,msg:'Email already registered.'};
    if (users.find(u=>u.username===data.username)) return {ok:false,msg:'Username already taken.'};
    const user = {id:'u'+Date.now(),...data,createdAt:new Date().toISOString()};
    users.push(user); this.saveUsers(users); return {ok:true,user};
  },
  findUser(ident,pass) { return this.getUsers().find(u=>(u.email===ident||u.username===ident)&&u.password===pass)||null; },
  updateUser(id,patch) {
    const users=this.getUsers(); const i=users.findIndex(u=>u.id===id);
    if(i===-1)return false; users[i]={...users[i],...patch}; this.saveUsers(users); return true;
  },
  getUserById(id) { return this.getUsers().find(u=>u.id===id)||null; },

  getOrders()   { return this.get('kc_orders') || []; },
  saveOrders(o) { this.set('kc_orders', o); },
  addOrder(data) {
    const orders=this.getOrders();
    const order={id:'ORD'+Date.now(),...data,status:'Pending',createdAt:new Date().toISOString()};
    orders.push(order); this.saveOrders(orders); return order;
  },
  updateOrder(id,patch) {
    const orders=this.getOrders(); const i=orders.findIndex(o=>o.id===id);
    if(i===-1)return false; orders[i]={...orders[i],...patch}; this.saveOrders(orders); return true;
  },

  getMessages()   { return this.get('kc_messages') || []; },
  saveMessages(m) { this.set('kc_messages', m); },
  sendMessage(from,to,text) {
    const msgs=this.getMessages();
    const msg={id:'msg'+Date.now(),from,to,text,ts:new Date().toISOString(),read:false};
    msgs.push(msg); this.saveMessages(msgs); return msg;
  },
  getConversation(a,b) { return this.getMessages().filter(m=>(m.from===a&&m.to===b)||(m.from===b&&m.to===a)); },
  markRead(from,to) {
    const msgs=this.getMessages();
    msgs.forEach(m=>{if(m.from===from&&m.to===to)m.read=true;}); this.saveMessages(msgs);
  },

  getDesigns()    { return this.get('kc_designs') || []; },
  saveDesigns(d)  { this.set('kc_designs', d); },
  addDesign(d)    { const ds=this.getDesigns(); const nd={id:'d'+Date.now(),...d,addedAt:new Date().toISOString()}; ds.push(nd); this.saveDesigns(ds); return nd; },
  removeDesign(id){ this.saveDesigns(this.getDesigns().filter(d=>d.id!==id)); },

  getMembers()    { return this.get('kc_members') || []; },
  saveMembers(m)  { this.set('kc_members', m); },
  addMember(m)    { const ms=this.getMembers(); const nm={id:'m'+Date.now(),...m}; ms.push(nm); this.saveMembers(ms); return nm; },
  removeMember(id){ this.saveMembers(this.getMembers().filter(m=>m.id!==id)); },
  updateMember(id,patch) {
    const ms=this.getMembers(); const i=ms.findIndex(m=>m.id===id);
    if(i===-1)return false; ms[i]={...ms[i],...patch}; this.saveMembers(ms); return true;
  },

  getClients()        { return this.get('kc_clients') || []; },
  getClientsShowName(){ const v=this.get('kc_clients_showname'); return v===null ? true : v; },
  setClientsShowName(v){ this.set('kc_clients_showname', v); },
  saveClients(cl) { this.set('kc_clients', cl); },
  addClient(cl)   { const cs=this.getClients(); const nc={id:'cl'+Date.now(),...cl}; cs.push(nc); this.saveClients(cs); return nc; },
  removeClient(id){ this.saveClients(this.getClients().filter(c=>c.id!==id)); },

  getContact()   { return this.get('kc_contact') || {}; },
  saveContact(c) { this.set('kc_contact', c); },

  setSession(u)  { sessionStorage.setItem('kc_session',JSON.stringify(u)); },
  getSession()   { try{return JSON.parse(sessionStorage.getItem('kc_session'));}catch{return null;} },
  clearSession() { sessionStorage.removeItem('kc_session'); },

  _otps:{},
  generateOTP(email) {
    const otp=String(Math.floor(100000+Math.random()*900000));
    this._otps[email]={otp,exp:Date.now()+5*60000}; return otp;
  },
  verifyOTP(email,otp) {
    const r=this._otps[email]; if(!r)return false;
    if(Date.now()>r.exp){delete this._otps[email];return false;}
    if(r.otp===String(otp)){delete this._otps[email];return true;} return false;
  }
};
KC.seed();
