$(async function(){
  // Parse URL param
  var urlParams = new URLSearchParams(window.location.search);
  var gameSlug = urlParams.get('game');
  var gameKey = Object.keys(gamesData).find(key => gamesData[key].slug === gameSlug);
  var gameDb = null;
  if(window.firebasePromise){ try{ await window.firebasePromise }catch(e){} }
  if(window.firebaseReady){
    try{
      var q = await window.db.collection('games').where('slug','==',gameSlug).limit(1).get();
      if(!q.empty){ gameDb = q.docs[0].data(); }
    }catch(e){}
  }
  var game = gameDb || (gameKey ? gamesData[gameKey] : null);
  
  if (!game) {
    alert('Game tidak ditemukan!');
    window.location.href = 'index.html';
    return;
  }
  
  // Render Info
  $('#game-title').text(game.title);
  $('#game-publisher').text(game.publisher);
  $('#game-desc').text(game.description);
  $('#game-image').attr('src', game.image).on('error', function(){ $(this).attr('src', 'https://placehold.co/400x600?text=No+Image'); });
  document.title = "Top Up " + game.title + " - MamaGaming";

  // Render Inputs
  var inputContainer = $('#input-fields');
  inputContainer.empty();
  
  // Prioritize fields from Firebase object (game.fields), fallback to gamesData or default
  var fields = game.fields || (gameKey && gamesData[gameKey] ? gamesData[gameKey].fields : null);
  
  if(!fields) {
      // Default fallback if no fields defined
      fields = game.zoneRequired ? [
        { id: "user_id", label: "User ID", type: "number", placeholder: "Contoh: 12345678" },
        { id: "zone_id", label: "Zone ID", type: "number", placeholder: "Contoh: 1234" }
      ] : [
        { id: "user_id", label: "User ID", type: "number", placeholder: "Contoh: 12345678" }
      ];
  }

  fields.forEach(function(field){
    var col = fields.length > 1 ? 'col-md-6' : 'col-12';
    var html = '';
    
    if (field.type === 'select') {
        var optionsHtml = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        html = `
          <div class="${col}">
            <label class="form-label fw-bold small text-white">${field.label}</label>
            <select class="form-select" id="${field.id}" required>
                <option value="" selected disabled>${field.placeholder || 'Pilih...'}</option>
                ${optionsHtml}
            </select>
          </div>
        `;
    } else {
        html = `
          <div class="${col}">
            <label class="form-label fw-bold small text-white">${field.label}</label>
            <input type="${field.type}" class="form-control" id="${field.id}" placeholder="${field.placeholder}" required>
          </div>
        `;
    }
    
    inputContainer.append(html);
  });

  // Render Nominal
  var nominalContainer = $('#nominal-grid');
  nominalContainer.empty();
  var nominalList = [];
  if(gameDb && window.firebaseReady){
    try{
      var ns = await window.db.collection('games').doc(game.slug).collection('nominal').orderBy('order').get();
      ns.forEach(function(d){ nominalList.push(d.data()) })
    }catch(e){}
  }
  if(nominalList.length===0){ nominalList = game.nominal || [] }
  
  function formatIDR(n){
    return new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);
  }

  nominalList.forEach(function(item){
    var html = `
      <div class="col">
        <label class="nominal-card d-block h-100 p-3 position-relative cursor-pointer text-center">
          <input type="radio" name="nominal" value="${item.code}" class="d-none" required>
          <div class="d-flex flex-column justify-content-center h-100">
            <div class="fw-bold small text-white mb-1 text-uppercase">${item.label}</div>
            <div class="text-warning fw-bold fs-5">${formatIDR(item.price)}</div>
          </div>
          <div class="check-icon position-absolute top-0 end-0 m-2 text-warning" style="display:none">
            <i class="fa-solid fa-circle-check fa-lg"></i>
          </div>
        </label>
      </div>
    `;
    nominalContainer.append(html);
  });

  // Nominal Selection Logic
  $(document).on('change', 'input[name="nominal"]', function(){
    $('.nominal-card').removeClass('active border-primary bg-primary-subtle');
    $('.check-icon').hide();
    
    var $parent = $(this).closest('.nominal-card');
    $parent.addClass('active border-primary bg-primary-subtle');
    $parent.find('.check-icon').show();
  });

  // Payment Selection Logic
  $(document).on('change', 'input[name="payment"]', function(){
    $('.list-group-item').removeClass('active border-primary bg-primary-subtle');
    var $parent = $(this).closest('.list-group-item');
    $parent.addClass('active border-primary bg-primary-subtle');
  });

  // Copy Invoice Logic
  $('#btn-copy-invoice').click(function(){
      var text = $('#modal-invoice').text();
      if(text && text !== '-'){
          navigator.clipboard.writeText(text).then(function() {
              var btn = $('#btn-copy-invoice');
              var originalHtml = btn.html();
              btn.removeClass('btn-outline-warning').addClass('btn-success').html('<i class="fa-solid fa-check"></i>');
              setTimeout(function(){
                  btn.removeClass('btn-success').addClass('btn-outline-warning').html(originalHtml);
              }, 2000);
          }).catch(function(err) {
              console.error('Failed to copy: ', err);
              // Fallback
              var textArea = document.createElement("textarea");
              textArea.value = text;
              document.body.appendChild(textArea);
              textArea.select();
              try {
                  document.execCommand('copy');
                  var btn = $('#btn-copy-invoice');
                  var originalHtml = btn.html();
                  btn.removeClass('btn-outline-warning').addClass('btn-success').html('<i class="fa-solid fa-check"></i>');
                  setTimeout(function(){
                      btn.removeClass('btn-success').addClass('btn-outline-warning').html(originalHtml);
                  }, 2000);
              } catch (err) {
                  console.error('Fallback copy failed', err);
              }
              document.body.removeChild(textArea);
          });
      }
  });

  // Submit Logic
  $('#order-form').on('submit', async function(e){
    e.preventDefault();
    var statusEl = $('#status');
    statusEl.removeClass('d-none alert-danger alert-success').addClass('alert-info').text('Memproses pesanan...');
    
    // Wait for firebase init
    if(window.firebasePromise) {
        try { await window.firebasePromise; } catch(e){}
    }

    // Collect Data
    var inputs = {};
    fields.forEach(f => {
      inputs[f.id] = $('#'+f.id).val();
    });
    
    var nominalCode = $('input[name="nominal"]:checked').val();
    var nominalObj = nominalList.find(n => n.code === nominalCode);
    var payment = $('input[name="payment"]:checked').val();
    var contact = $('#contact').val();

    if (!window.firebaseReady) {
      statusEl.removeClass('alert-info').addClass('alert-danger').text('Error: Firebase belum dikonfigurasi.');
      return;
    }

    try {
      var user = firebase.auth().currentUser;
      var email = (user && !user.isAnonymous) ? user.email : null;

      var orderId = 'ORD-' + Math.floor(Math.random() * 1000000000);
      var uniqueCode = Math.floor(Math.random() * 999) + 1; // 1 to 999
      var finalPrice = nominalObj.price + uniqueCode;

      var data = {
        orderId: orderId,
        game: game.title,
        gameSlug: game.slug,
        inputs: inputs,
        playerId: inputs.user_id || inputs.player_id || (fields.length > 0 ? inputs[fields[0].id] : null),
        zoneId: inputs.zone_id || inputs.server_id || (fields.length > 1 ? inputs[fields[1].id] : null),
        nominalCode: nominalObj.code,
        nominalLabel: nominalObj.label,
        nominal: nominalObj.label,
        price: nominalObj.price,
        uniqueCode: uniqueCode,
        finalPrice: finalPrice,
        paymentMethod: payment,
        payment: payment,
        contact: contact,
        status: 'pending',
        email: email, // Save user email for history tracking
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await window.db.collection('orders').add(data);
      
      // Update Modal Content
      $('#modal-invoice').text(orderId);
      $('#modal-price').text(formatIDR(nominalObj.price));
      $('#modal-unique-code').text('+ ' + formatIDR(uniqueCode));
      $('#modal-final-price').text(formatIDR(finalPrice));
      $('#modal-total-price').text(formatIDR(finalPrice));
      
      // Setup Payment Link
      var paymentLink = 'https://bagibagi.co/daypay';
      $('#btn-confirm-payment').attr('href', paymentLink);

      // Show Success Message with Button to Open Modal
      statusEl.removeClass('alert-info').addClass('alert-success')
        .html(`
          <div class="text-center">
            <h5 class="alert-heading"><i class="fa-solid fa-circle-check"></i> Pesanan Berhasil!</h5>
            <p>ID Pesanan: <strong>${orderId}</strong></p>
            <hr>
            <p class="mb-2">Silakan selesaikan pembayaran:</p>
            <button type="button" class="btn btn-success fw-bold px-4 py-2 rounded-pill" data-bs-toggle="modal" data-bs-target="#paymentModal">
              <i class="fa-solid fa-money-bill-wave me-2"></i> Bayar Sekarang
            </button>
            <div class="small text-muted mt-2">Klik tombol di atas untuk melihat detail pembayaran.</div>
          </div>
        `);
      
      $('#submit-btn').prop('disabled', true).text('Menunggu Pembayaran...');
      
      // Automatically show modal
      var paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
      paymentModal.show();
      
    } catch (err) {
      console.error(err);
      var msg = 'Gagal membuat pesanan. '
      if (err && err.code === 'permission-denied') {
        msg += 'Atur Firestore Rules agar mengizinkan write untuk user terautentikasi.'
      } else if (err && err.code === 'auth/operation-not-allowed') {
        msg += 'Aktifkan Anonymous Auth di Firebase Authentication.'
      } else if (err && err.code === 'auth/network-request-failed') {
        msg += 'Jalankan situs melalui http:// (bukan file://).'
      } else {
        msg += 'Coba lagi.'
      }
      statusEl.removeClass('alert-info').addClass('alert-danger').text(msg);
    }
  });

});
