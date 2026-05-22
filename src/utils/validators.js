/**
 * Validation Utilities
 */
const Validators = {
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    isValidPassword(password) {
        return password && password.length >= 6;
    },

    isValidName(name) {
        return name && name.trim().length >= 2;
    },

    // FIX BUG-06: validate student ID format
    isValidStudentId(id) {
        return id && id.trim().length >= 3;
    },

    isValidPhone(phone) {
        return !phone || /^[\d\s\-\+\(\)]+$/.test(phone);
    },

    isNotEmpty(value) {
        return value && value.trim().length > 0;
    },

    sanitize(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};
