/**
 * Helper Utilities
 */
const Helpers = {
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year:   'numeric',
            month:  'short',
            day:    'numeric',
            hour:   '2-digit',
            minute: '2-digit'
        });
    },

    getRelativeTime(isoString) {
        const date           = new Date(isoString);
        const now            = new Date();
        const diffInSeconds  = Math.floor((now - date) / 1000);

        // FIX BUG-13: guard against negative diff (clock skew / future dates)
        if (diffInSeconds < 0)     return 'Just now';
        if (diffInSeconds < 60)    return 'Just now';
        if (diffInSeconds < 3600)  return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800)return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return this.formatDate(isoString);
    },

    showNotification(message, type = 'info') {
        const notification        = document.createElement('div');
        notification.className    = `notification notification-${type}`;
        notification.textContent  = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    confirmAction(message) {
        return confirm(message);
    },

    redirectTo(page) {
        window.location.href = page;
    },

    getStatusColor(status) {
        const colors = {
            'Pending':     '#FF9800',
            'In Progress': '#2196F3',
            'Resolved':    '#4CAF50',
            'Rejected':    '#f44336'
        };
        return colors[status] || '#757575';
    },

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    ,
    async hashPassword(password) {
        if (!password) return '';
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
};
