import firebase from 'firebase'
// import Vue from 'vue'

const state = {
  all: []
}
const getters = {
  nonOwners: (state) => (siteid) => {
    if (state.all === {}) return {}
    return state.all.filter(user => {
      if (user.owns === null || typeof user.owns === 'undefined') return true
      console.log(typeof owns, user.owns)
      return !user.owns.includes(siteid)
    }) // !== null)// Object.prototype.hasOwnProperty.call(owns, siteid))
  },
  /**
   * get all nicks, omits current if given
   */
  nicks: (state) => (current) => {
    // console.log('getters/nick', state.all)
    var n = []
    for (var i in state.all) {
      if (state.all[i].nick !== current) n.push(state.all[i].nick)
    }
    return n
  }
}
const actions = {
  getAll (context) {
    console.log('users/getAll')

    context.state.all = []

    const db = firebase.firestore()
    db.collection('profiles').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log('setting user', doc.id, doc.data())
        var u = doc.data()
        u.uid = doc.id
        context.state.all.push(u)
        // Vue.set(state.all, doc.data().nick, u)
      })
    })
  },
  addOwner (context, { nick, siteid }) {
    const s = context.state.all.filter(user => user.nick === nick)
    const u = s[0]
    if (!exists(u) || !exists(siteid)) return
    const db = firebase.firestore()
    db.collection('sites').doc(siteid).collection('owners').doc(u.uid).set({ nick: u.nick })
    var owns = []
    db.collection('profiles').doc(u.uid).get().then((doc) => {
      // console.log('user is', doc.data())
      const o = doc.data().owns
      if (exists(o)) owns = o
      owns.push(siteid)
      db.collection('profiles').doc(u.uid).update({ owns: owns })
      context.dispatch('binder/getFullSite', { siteid: siteid }, { root: true })
    })
  },
  addMember (context, { nick, siteid }) {
    const s = context.state.all.filter(user => user.nick === nick)
    const u = s[0]
    if (!exists(u) || !exists(siteid)) return
    const db = firebase.firestore()
    db.collection('sites').doc(siteid).collection('members').doc(u.uid).set({ nick: u.nick })
    var mem = []
    db.collection('profiles').doc(u.uid).get().then((doc) => {
      // console.log('user is', doc.data())
      const o = doc.data().member
      if (exists(o)) mem = o
      mem.push(siteid)
      db.collection('profiles').doc(u.uid).update({ member: mem })
      context.dispatch('binder/getFullSite', { siteid: siteid }, { root: true })
    })
  },
  revokeOwner (context, { uid, siteid }) {
    console.log('users/revokeOwner', uid, siteid)
    const db = firebase.firestore()

    var owns = null
    db.collection('profiles').doc(uid).get().then((doc) => {
      console.log('user is', doc.data())
      const s = doc.data()
      owns = s.owns
      console.log(owns)
      if (exists(owns)) {
        console.log('before', owns)
        owns = owns.filter(owns => owns !== siteid)
        console.log('after', owns)
        db.collection('profiles').doc(uid).update({
          owns: owns
        })
        db.collection('sites').doc(siteid).collection('owners').doc(uid).delete()
        context.dispatch('binder/getFullSite', { siteid: siteid }, { root: true })
      }
    })
    /* db.collection('sites').doc(siteid).collection('owners').get().then((querySnapshot) => {
        querySnapshot.forEach((own) => {
          var o = own.data()
          o.uid = own.id
          site.owners[own.id] = o
        })
        console.log('got', site)
        context.commit('patchSites', { id: siteid, data: site, current: siteid })
      }) */
  },
  revokeMember (context, { uid, siteid }) {
    console.log('users/revokeMember', uid, siteid)
    const db = firebase.firestore()

    var mem = null
    db.collection('profiles').doc(uid).get().then((doc) => {
      console.log('user is', doc.data())
      const s = doc.data()
      mem = s.member
      console.log(mem)
      if (exists(mem)) {
        console.log('before', mem)
        mem = mem.filter(mem => mem !== siteid)
        console.log('after', mem)
        db.collection('profiles').doc(uid).update({
          member: mem
        })
        db.collection('sites').doc(siteid).collection('members').doc(uid).delete()
        context.dispatch('binder/getFullSite', { siteid: siteid }, { root: true })
      }
    })
  }
}

function exists (a) {
  return a !== null && typeof a !== 'undefined'
}

export default {
  namespaced: true,
  actions,
  getters,
  state
}
