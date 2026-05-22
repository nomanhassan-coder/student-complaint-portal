/**
 * Main Application Bootstrap
 */

const storage          = new StorageService();
const authService      = new AuthService(storage);
const studentService   = new StudentService(storage);
const complaintService = new ComplaintService(storage);

window.App = {
    storage,
    authService,
    studentService,
    complaintService,

    init() {
        this.checkAuth();
    },

    checkAuth() {
        const currentUser = this.authService.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();

        // FIX BUG-10: register.html is also a public (unauthenticated) page
        const publicPages = ['index.html', 'login.html', 'register.html', ''];

        if (!currentUser && !publicPages.includes(currentPage)) {
            Helpers.redirectTo('login.html');
            return;
        }

        if (currentUser) {
            if (publicPages.includes(currentPage)) {
                if (currentUser.role === 'admin') {
                    Helpers.redirectTo('admin-dashboard.html');
                } else {
                    Helpers.redirectTo('student-dashboard.html');
                }
            }
        }
    },

    logout() {
        if (Helpers.confirmAction('Are you sure you want to logout?')) {
            this.authService.logout();
            Helpers.showNotification('Logged out successfully', 'success');
            Helpers.redirectTo('login.html');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
