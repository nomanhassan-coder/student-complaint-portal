/**
 * Base User Model
 * Demonstrates: Encapsulation, Abstraction
 */
class User {
    #id;
    #email;
    #password;
    #role;
    #createdAt;

    // FIX BUG-02: accept optional createdAt so fromJSON can restore saved date
    constructor(id, email, password, role, createdAt = null) {
        this.#id = id;
        this.#email = email;
        this.#password = password;
        this.#role = role;
        this.#createdAt = createdAt || new Date().toISOString();
    }

    // Getters (Encapsulation)
    getId() { return this.#id; }
    getEmail() { return this.#email; }
    getPassword() { return this.#password; }
    getRole() { return this.#role; }
    getCreatedAt() { return this.#createdAt; }

    // Setters with validation
    setEmail(email) {
        if (!this.#validateEmail(email)) {
            throw new Error('Invalid email format');
        }
        this.#email = email;
    }

    setPassword(password) {
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        this.#password = password;
    }

    // Private validation method
    #validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Convert to plain object for storage
    toJSON() {
        return {
            id: this.#id,
            email: this.#email,
            password: this.#password,
            role: this.#role,
            createdAt: this.#createdAt
        };
    }

    // FIX BUG-02: pass createdAt so the restored object keeps original date
    static fromJSON(data) {
        return new User(data.id, data.email, data.password, data.role, data.createdAt);
    }
}
