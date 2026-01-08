$(document).ready(function() {
    // Wait for firebase init
    const initAuth = async () => {
        if(window.firebasePromise) {
            try { await window.firebasePromise; } catch(e){ console.error(e); }
        }
        
        // Check if already logged in
        firebase.auth().onAuthStateChanged((user) => {
            if (user && !user.isAnonymous) {
                // User is signed in, redirect to home or dashboard
                // For now, redirect to home
                window.location.href = 'index.html';
            }
        });
    };

    initAuth();

    // Toggle logic removed as pages are now separate

    // Login Handler
    $('#login-form').on('submit', async function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        const btn = $(this).find('button[type="submit"]');
        const err = $('#error-message');
        const succ = $('#success-message');

        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i> Loading...');
        err.addClass('d-none').text('');
        succ.addClass('d-none').text('');

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            succ.removeClass('d-none').text('Login berhasil! Mengalihkan...');
            // Redirect handled by onAuthStateChanged
        } catch (error) {
            console.error(error);
            let msg = 'Login gagal. Periksa email dan password.';
            if (error.code === 'auth/user-not-found') msg = 'Akun tidak ditemukan.';
            if (error.code === 'auth/wrong-password') msg = 'Password salah.';
            if (error.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan gagal. Coba lagi nanti.';
            
            err.removeClass('d-none').text(msg);
            btn.prop('disabled', false).html('Login Sekarang');
        }
    });

    // Register Handler
    $('#register-form').on('submit', async function(e) {
        e.preventDefault();
        const email = $('#reg-email').val();
        const password = $('#reg-password').val();
        const confirm = $('#reg-password-confirm').val();
        const btn = $(this).find('button[type="submit"]');
        const err = $('#error-message');
        const succ = $('#success-message');

        if (password !== confirm) {
            err.removeClass('d-none').text('Password tidak cocok.');
            return;
        }

        if (password.length < 6) {
            err.removeClass('d-none').text('Password minimal 6 karakter.');
            return;
        }

        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i> Mendaftar...');
        err.addClass('d-none').text('');
        succ.addClass('d-none').text('');

        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            succ.removeClass('d-none').text('Pendaftaran berhasil! Mengalihkan...');
            // Redirect will happen automatically by onAuthStateChanged
        } catch (error) {
            console.error(error);
            let msg = 'Pendaftaran gagal.';
            if (error.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar.';
            if (error.code === 'auth/invalid-email') msg = 'Format email salah.';
            if (error.code === 'auth/weak-password') msg = 'Password terlalu lemah.';
            
            err.removeClass('d-none').text(msg);
            btn.prop('disabled', false).html('Daftar Sekarang');
        }
    });

});
