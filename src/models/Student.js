/**
 * Student Model (Inherits from User)
 * Demonstrates: Inheritance
 */
class Student extends User {
    #name;
    #studentId;
    #department;
    #phone;

    constructor(id, email, password, name, studentId, department, phone, createdAt = null) {
        // FIX BUG-02: forward createdAt to User base class
        super(id, email, password, 'student', createdAt);
        this.#name = name;
        this.#studentId = studentId;
        this.#department = department || 'Not Specified';
        this.#phone = phone || '';
    }

    // Getters
    getName() { return this.#name; }
    getStudentId() { return this.#studentId; }
    getDepartment() { return this.#department; }
    getPhone() { return this.#phone; }

    // Setters
    setName(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Name cannot be empty');
        }
        this.#name = name.trim();
    }

    setDepartment(department) {
        this.#department = department;
    }

    setPhone(phone) {
        this.#phone = phone;
    }

    // Override toJSON to include student-specific fields
    toJSON() {
        return {
            ...super.toJSON(),
            name: this.#name,
            studentId: this.#studentId,
            department: this.#department,
            phone: this.#phone
        };
    }

    // FIX BUG-02: pass createdAt through so registration date is preserved
    static fromJSON(data) {
        return new Student(
            data.id,
            data.email,
            data.password,
            data.name,
            data.studentId,
            data.department,
            data.phone,
            data.createdAt
        );
    }
}
