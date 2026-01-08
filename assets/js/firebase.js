;(function(){
  var cfg = window.firebaseConfig || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  }
  var ready = !!cfg.apiKey && !!cfg.projectId
  if (!ready) {
    window.firebaseReady = false
    return
  }
  var app = firebase.initializeApp(cfg)
  var db = firebase.firestore(app)
  try { db.settings({ ignoreUndefinedProperties: true }) } catch(e){}
  var auth = firebase.auth(app)
  
  window.firebasePromise = new Promise(function(resolve, reject) {
    var unsubscribe = auth.onAuthStateChanged(function(user) {
      unsubscribe();
      if (user) {
        // User is already signed in (either anonymous or real)
        window.firebaseReady = true
        window.firebaseApp = app
        window.db = db
        window.auth = auth
        console.log('Firebase Connected (Existing User):', user.email || 'Anonymous');
        resolve();
      } else {
        // No user, sign in anonymously for public access if needed
        // But if we want to allow guest access without forcing anon immediately (to avoid conflict during login flow),
        // we might want to check if we are on login page?
        // Actually, for this app, let's assume we fallback to anonymous if not logged in, 
        // effectively making every visitor at least anonymous.
        auth.signInAnonymously().then(function() {
          window.firebaseReady = true
          window.firebaseApp = app
          window.db = db
          window.auth = auth
          console.log('Firebase Connected (New Anonymous)');
          resolve();
        }).catch(function(err) {
          window.firebaseReady = false
          console.error('Firebase Auth Error:', err);
          reject(err);
        });
      }
    });
  });
})()
