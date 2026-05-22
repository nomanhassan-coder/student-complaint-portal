/**
 * Authentication Service
 *
 * FIX BUG-03: After finding a matching user by email+password, verify that the
 * stored role matches the requested role. Without this check the client-side
 * `currentRole` variable is fully attacker-controlled.
 */
class AuthService {
    #storage;

    constructor(storageService) {
        this.#storage = storageService;
    }
    async register(email, password, name, studentId, department, phone) {
        const students = this.#storage.getStudents();
        const admins   = this.#storage.getAdmins();

        const emailExists = [...students, ...admins].some(
            user => user.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) throw new Error('Email already registered');

        // FIX BUG-06: basic studentId presence check before DB call
        if (!studentId || studentId.trim().length < 3) {
            throw new Error('Student ID must be at least 3 characters');
        }

        const studentIdExists = students.some(s => s.studentId === studentId);
        if (studentIdExists) throw new Error('Student ID already registered');

        const id = this.#storage.generateId(students);
        const hashed = await Helpers.hashPassword(password);
        const student = new Student(id, email, hashed, name, studentId, department, phone);

        students.push(student.toJSON());
        this.#storage.saveStudents(students);
        return student;
    }

    async login(email, password, role) {
        let users = [];
        if (role === 'admin') {
            users = this.#storage.getAdmins();
        } else {
            users = this.#storage.getStudents();
        }

        const hashed = await Helpers.hashPassword(password);

        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() &&
                 u.password === hashed
        );

        if (!user) throw new Error('Invalid email or password');

        // FIX BUG-03: ensure the stored role matches what was requested
        if (user.role !== role) throw new Error('Invalid email or password');

        // Store minimal session object (do not store password)
        const sessionUser = {
            id:        user.id,
            email:     user.email,
            role:      user.role,
            name:      user.name || '',
            createdAt: user.createdAt
        };
        this.#storage.setCurrentUser(sessionUser);
        return sessionUser;
    }

    logout() {
        this.#storage.clearCurrentUser();
    }

    getCurrentUser() {
        return this.#storage.getCurrentUser();
    }

    isAuthenticated() { return this.getCurrentUser() !== null; }
    isAdmin()   { const u = this.getCurrentUser(); return u && u.role === 'admin'; }
    isStudent() { const u = this.getCurrentUser(); return u && u.role === 'student'; }

    async changePassword(oldPassword, newPassword) {
        const sessionUser = this.getCurrentUser();
        if (!sessionUser) throw new Error('No user logged in');
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');

        const oldHashed = await Helpers.hashPassword(oldPassword);
        const newHashed = await Helpers.hashPassword(newPassword);

        if (sessionUser.role === 'student') {
            const students = this.#storage.getStudents();
            const index = students.findIndex(s => String(s.id) === String(sessionUser.id));
            if (index === -1) throw new Error('User not found');
            if (students[index].password !== oldHashed) throw new Error('Current password is incorrect');
            students[index].password = newHashed;
            this.#storage.saveStudents(students);
            const updated = students[index];
            const session = { id: updated.id, email: updated.email, role: updated.role, name: updated.name || '', createdAt: updated.createdAt };
            this.#storage.setCurrentUser(session);
        } else {
            const admins = this.#storage.getAdmins();
            const index = admins.findIndex(a => String(a.id) === String(sessionUser.id));
            if (index === -1) throw new Error('User not found');
            if (admins[index].password !== oldHashed) throw new Error('Current password is incorrect');
            admins[index].password = newHashed;
            this.#storage.saveAdmins(admins);
            const updated = admins[index];
            const session = { id: updated.id, email: updated.email, role: updated.role, name: updated.name || '', createdAt: updated.createdAt };
            this.#storage.setCurrentUser(session);
        }

        return true;
    }
}
