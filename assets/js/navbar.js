$(document).ready(function() {
    // Check if firebase is initialized
    const initNavbar = async () => {
        if(window.firebasePromise) {
            try { await window.firebasePromise; } catch(e){ console.error(e); }
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user && !user.isAnonymous) {
                // User is logged in
                $('#auth-buttons').addClass('d-none');
                $('#user-menu-container').removeClass('d-none');
                $('#user-email-display').text(user.email.split('@')[0]); // Show username part of email

                // Check if user is admin
                if (user.email === 'admin@mamagaming.com') {
                    // Check if button already exists to prevent duplicates
                    if ($('#admin-dashboard-link').length === 0) {
                        const adminLink = '<li><a class="dropdown-item text-warning fw-bold" href="admin/index.html" id="admin-dashboard-link"><i class="fa-solid fa-user-shield me-2"></i> Halaman Admin</a></li>';
                        // Insert before the divider
                        $('#user-menu-container .dropdown-menu li:has(.dropdown-divider)').before(adminLink);
                    }
                } else {
                    $('#admin-dashboard-link').parent().remove();
                }

            } else {
                // User is logged out
                $('#auth-buttons').removeClass('d-none');
                $('#user-menu-container').addClass('d-none');
                $('#admin-dashboard-link').parent().remove();
            }
        });
    };

    initNavbar();

    // Scroll effect for navbar
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar-custom').addClass('scrolled');
        } else {
            $('.navbar-custom').removeClass('scrolled');
        }
    });

    // Logout Handler
    $('#logout-btn').on('click', async function(e) {
        e.preventDefault();
        try {
            await firebase.auth().signOut();
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Gagal logout: ' + error.message);
        }
    });
});
