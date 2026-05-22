/**
 * Storage Service - Handles all localStorage operations
 */
class StorageService {
    #storageKeys = {
        STUDENTS:     'students_data',
        COMPLAINTS:   'complaints_data',
        ADMINS:       'admins_data',
        CURRENT_USER: 'current_user',
        SETTINGS:     'app_settings'
    };

    constructor() {
        this.#initializeStorage();
    }

    #initializeStorage() {
        if (!this.#exists(this.#storageKeys.ADMINS)) {
            // Password stored as SHA-256 hex of 'admin123'
            const defaultAdmin = {
                id:        1,
                email:     'admin@portal.com',
                password:  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
                role:      'admin',
                name:      'System Admin',
                createdAt: new Date().toISOString()
            };
            this.#write(this.#storageKeys.ADMINS, [defaultAdmin]);
        }

        if (!this.#exists(this.#storageKeys.STUDENTS)) {
            this.#write(this.#storageKeys.STUDENTS, []);
        }

        if (!this.#exists(this.#storageKeys.COMPLAINTS)) {
            this.#write(this.#storageKeys.COMPLAINTS, []);
        }
    }

    #exists(key) {
        return localStorage.getItem(key) !== null;
    }

    #read(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return null;
        }
    }

    #write(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing ${key}:`, error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage limit exceeded. Please clear some data.');
            }
            return false;
        }
    }

    #delete(key) {
        localStorage.removeItem(key);
    }

    getStudents()          { return this.#read(this.#storageKeys.STUDENTS)     || []; }
    saveStudents(students) { return this.#write(this.#storageKeys.STUDENTS, students); }

    getComplaints()              { return this.#read(this.#storageKeys.COMPLAINTS)     || []; }
    saveComplaints(complaints)   { return this.#write(this.#storageKeys.COMPLAINTS, complaints); }

    getAdmins()          { return this.#read(this.#storageKeys.ADMINS)     || []; }
    saveAdmins(admins)   { return this.#write(this.#storageKeys.ADMINS, admins); }

    getCurrentUser()       { return this.#read(this.#storageKeys.CURRENT_USER); }
    setCurrentUser(user)   { return this.#write(this.#storageKeys.CURRENT_USER, user); }
    clearCurrentUser()     { this.#delete(this.#storageKeys.CURRENT_USER); }

    // FIX BUG-09: filter out NaN/undefined ids before calling Math.max
    generateId(existingItems) {
        if (!existingItems || existingItems.length === 0) return 1;
        const ids = existingItems
            .map(item => Number(item.id))
            .filter(id => !isNaN(id));
        return ids.length === 0 ? 1 : Math.max(...ids) + 1;
    }

    clearAllData() {
        Object.values(this.#storageKeys).forEach(key => this.#delete(key));
        this.#initializeStorage();
    }

    exportData() {
        // Return an object suitable for export with sensitive fields removed
        const students = this.getStudents().map(s => ({
            id: s.id,
            email: s.email,
            role: s.role,
            name: s.name,
            studentId: s.studentId,
            department: s.department,
            phone: s.phone,
            createdAt: s.createdAt
        }));
        const complaints = this.getComplaints();
        return {
            students,
            complaints,
            exportedAt: new Date().toISOString()
        };
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.students)   this.saveStudents(data.students);
            if (data.complaints) this.saveComplaints(data.complaints);
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
}
