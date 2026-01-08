$(function(){
  var statusEl = $('#orders-status')
  var tableEl = $('#orders-table')
  var currentSearchUnsubscribe = null;
  
  function fmtTs(ts){
    if (!ts) return '-'
    // Handle Firestore Timestamp
    var d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('id-ID')
  }
  
  function formatIDR(n){
    if (typeof n !== 'number') return '-'
    return new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n)
  }
  
  function maskPhone(s){
    if (!s) return '-'
    var d = (s+'').replace(/\D/g,'')
    if (d.length <= 5) return d
    var start = d.slice(0,5)
    var end = d.slice(-2)
    return start+'*****'+end
  }
  
  function maskInvoice(s){
    if (!s) return '-'
    var t = (s+'').trim()
    if (t.length <= 4) return t
    var start = t.slice(0,2)
    var end = t.slice(-2)
    var stars = Math.max(5, t.length - 4)
    return start + '*'.repeat(stars) + end
  }

  function renderRow(o, docId) {
    var phone = maskPhone(o.contact)
    var nominal = o.nominalLabel || o.nominal || o.nominalCode || '-'
    var invoice = maskInvoice(o.orderId || docId)
    var tr = $('<tr>')
    
    $('<td>').text(fmtTs(o.createdAt)).addClass('ps-4').appendTo(tr)
    $('<td>').text(invoice).addClass('font-monospace').appendTo(tr)
    $('<td>').text(phone).addClass('font-monospace').appendTo(tr)
    $('<td>').text(nominal).appendTo(tr)
    $('<td>').text(formatIDR(o.finalPrice ?? o.price ?? 0)).appendTo(tr)
    
    var s = (o.status || '-').toLowerCase()
    var $status
    if (s==='success' || s==='paid' || s==='completed') $status=$('<div>').addClass('text-success fw-bold').html('<i class="fa-solid fa-circle-check me-1"></i> Success')
    else if (s==='processing') $status=$('<div>').addClass('text-info fw-bold').html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Processing')
    else if (s==='pending' || s==='waiting') $status=$('<div>').addClass('text-warning fw-bold').html('<i class="fa-solid fa-clock me-1"></i> Pending')
    else if (s==='failed' || s==='cancelled') $status=$('<div>').addClass('text-danger fw-bold').html('<i class="fa-solid fa-circle-xmark me-1"></i> Failed')
    else $status=$('<div>').addClass('text-muted').text(o.status || '-')
    
    $('<td>').append($status).addClass('pe-4').appendTo(tr)
    return tr
  }

  function renderModalContent(o, docId) {
    var statusBadge = '';
    var s = (o.status || '-').toLowerCase();
    
    if (s==='success' || s==='paid' || s==='completed') statusBadge = '<span class="text-success fw-bold"><i class="fa-solid fa-circle-check me-1"></i> Success</span>';
    else if (s==='processing') statusBadge = '<span class="text-info fw-bold"><i class="fa-solid fa-spinner fa-spin me-1"></i> Processing</span>';
    else if (s==='pending' || s==='waiting') statusBadge = '<span class="text-warning fw-bold"><i class="fa-solid fa-clock me-1"></i> Pending</span>';
    else if (s==='failed' || s==='cancelled') statusBadge = '<span class="text-danger fw-bold"><i class="fa-solid fa-circle-xmark me-1"></i> Failed</span>';
    else statusBadge = '<span class="text-muted fw-bold">' + (o.status || '-') + '</span>';

    return `
        <div class="row g-3">
            <div class="col-6"><span class="text-white-50">Nomor Invoice</span></div>
            <div class="col-6 fw-bold text-end text-break text-white">${o.orderId || docId}</div>
            
            <div class="col-6"><span class="text-white-50">Tanggal</span></div>
            <div class="col-6 fw-bold text-end text-white">${fmtTs(o.createdAt)}</div>
            
            <div class="col-6"><span class="text-white-50">Produk</span></div>
            <div class="col-6 fw-bold text-end text-white">${o.nominalLabel || o.nominal || '-'}</div>
            
            <div class="col-6"><span class="text-white-50">Harga</span></div>
            <div class="col-6 fw-bold text-end text-warning">${formatIDR(o.finalPrice ?? o.price ?? 0)}</div>
            
            <div class="col-6"><span class="text-white-50">Status</span></div>
            <div class="col-6 text-end">${statusBadge}</div>

            <div class="col-6"><span class="text-white-50">No. WhatsApp</span></div>
            <div class="col-6 fw-bold text-end text-white">${o.contact || '-'}</div>
        </div>
    `;
  }

  async function searchOrder(e) {
    e.preventDefault();
    var invoice = $('#invoice-input').val().trim();
    if (!invoice) return;

    // Wait for firebase init
    if(window.firebasePromise) {
        try { await window.firebasePromise; } catch(e){}
    }

    if (!window.firebaseReady) {
        alert('Gagal terhubung ke database.');
        return;
    }

    // Clear previous listener if any
    if (currentSearchUnsubscribe) {
        currentSearchUnsubscribe();
        currentSearchUnsubscribe = null;
    }

    try {
        var docRef = window.db.collection('orders').doc(invoice);
        var docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            // Try searching by orderId field if doc id doesn't match
            var querySnap = await window.db.collection('orders').where('orderId', '==', invoice).limit(1).get();
            if (!querySnap.empty) {
                docRef = querySnap.docs[0].ref;
            } else {
                alert('Pesanan tidak ditemukan!');
                return;
            }
        }
        
        // Setup Realtime Listener for this specific order
        var modalEl = document.getElementById('searchResultModal');
        var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

        currentSearchUnsubscribe = docRef.onSnapshot(function(snap) {
            if (!snap.exists) {
                $('#search-result-content').html('<div class="alert alert-danger">Data pesanan tidak lagi tersedia.</div>');
                return;
            }
            var o = snap.data();
            $('#search-result-content').html(renderModalContent(o, snap.id));
        }, function(error) {
            console.error("Search listener error:", error);
            $('#search-result-content').html('<div class="alert alert-danger">Gagal memuat update data.</div>');
        });

        // Unsubscribe when modal is closed
        $(modalEl).one('hidden.bs.modal', function () {
            if (currentSearchUnsubscribe) {
                currentSearchUnsubscribe();
                currentSearchUnsubscribe = null;
            }
        });

    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat mencari pesanan.');
    }
  }

  function setupRealtimeListener(user) {
      // Unsubscribe existing listener if any
      if (window.ordersUnsubscribe) {
          window.ordersUnsubscribe();
      }

      let query = window.db.collection('orders');

      if (user) {
          if (user.email === 'admin@mamagaming.com') {
              // Admin: Show ALL orders (realtime)
              query = query.orderBy('createdAt', 'desc').limit(50);
              
              $('h4.fw-bold.mb-2').text('Semua Transaksi (Mode Admin)');
              $('p.text-muted.small.mb-4').text('Menampilkan semua data transaksi masuk secara realtime.');
          } else {
              // Regular Logged in user: Show only their own orders
              // NOTE: Removing orderBy to avoid composite index requirement error
              query = query.where('email', '==', user.email).limit(50);
              
              $('h4.fw-bold.mb-2').text('Riwayat Pesanan Anda');
              $('p.text-muted.small.mb-4').text('Daftar transaksi yang pernah Anda lakukan.');
          }
      } else {
          // Public feed: Show 10 recent orders
          query = query.orderBy('createdAt','desc').limit(10);
          
          $('h4.fw-bold.mb-2').text('10 Transaksi Terakhir');
          $('p.text-muted.small.mb-4').text('Berikut ini realtime data pesanan masuk terbaru MAMAGAMING.');
      }

      window.ordersUnsubscribe = query.onSnapshot(function(snap) {
            tableEl.empty();
            if (snap.empty) {
                tableEl.html('<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada transaksi</td></tr>');
                return;
            }

            // Client-side sorting because we removed server-side orderBy for logged-in users
            var docs = [];
            snap.forEach(function(doc) {
                docs.push({ id: doc.id, data: doc.data() });
            });

            docs.sort(function(a, b) {
                var tA = a.data.createdAt ? (a.data.createdAt.seconds || 0) : 0;
                var tB = b.data.createdAt ? (b.data.createdAt.seconds || 0) : 0;
                return tB - tA; // Descending
            });

            docs.forEach(function(item){
                var tr = renderRow(item.data, item.id);
                tr.appendTo(tableEl);
            });
        }, function(error) {
            console.error("Error getting realtime updates: ", error);
            statusEl.removeClass('d-none').addClass('alert-danger').text('Gagal memuat update realtime.');
        });
  }

  async function init() {
    statusEl.addClass('d-none'); 
    
    // Wait for firebase init
    if(window.firebasePromise) {
        try { await window.firebasePromise; } catch(e){}
    }

    if (!window.firebaseReady) {
        statusEl.removeClass('d-none').addClass('alert-danger').text('Konfigurasi Firebase belum diatur atau gagal terhubung.');
        return;
    }

    // Setup listener based on auth state
    window.auth.onAuthStateChanged(function(user) {
        if (user && !user.isAnonymous) {
            setupRealtimeListener(user);
        } else {
            setupRealtimeListener(null);
        }
    });
  }

  $('#search-order-form').on('submit', searchOrder);
  
  init();
})
