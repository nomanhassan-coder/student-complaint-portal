/**
 * Student Service
 */
class StudentService {
    #storage;

    constructor(storageService) {
        this.#storage = storageService;
    }

    getAllStudents() {
        return this.#storage.getStudents().map(data => Student.fromJSON(data));
    }

    // FIX BUG-04: coerce both ids to String to avoid strict === type mismatch
    getStudentById(studentId) {
        return this.getAllStudents().find(
            s => String(s.getId()) === String(studentId)
        );
    }

    getStudentByEmail(email) {
        return this.getAllStudents().find(
            s => s.getEmail().toLowerCase() === email.toLowerCase()
        );
    }

    getStudentByStudentId(studentId) {
        return this.getAllStudents().find(s => s.getStudentId() === studentId);
    }

    updateStudent(studentId, updates) {
        const students = this.#storage.getStudents();
        // FIX BUG-04: coerce both sides
        const index = students.findIndex(s => String(s.id) === String(studentId));
        if (index === -1) throw new Error('Student not found');

        const student = Student.fromJSON(students[index]);
        if (updates.name)       student.setName(updates.name);
        if (updates.department) student.setDepartment(updates.department);
        if (updates.phone)      student.setPhone(updates.phone);
        if (updates.email)      student.setEmail(updates.email);

        students[index] = student.toJSON();
        this.#storage.saveStudents(students);
        return student;
    }

    deleteStudent(studentId) {
        const students = this.#storage.getStudents();
        // FIX BUG-04: coerce both sides
        const filtered = students.filter(s => String(s.id) !== String(studentId));
        if (students.length === filtered.length) throw new Error('Student not found');
        this.#storage.saveStudents(filtered);
        return true;
    }

    getStudentCount() {
        return this.getAllStudents().length;
    }

    searchStudents(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) return this.getAllStudents();
        const term = searchTerm.toLowerCase();
        return this.getAllStudents().filter(s =>
            s.getName().toLowerCase().includes(term)       ||
            s.getEmail().toLowerCase().includes(term)      ||
            s.getStudentId().toLowerCase().includes(term)  ||
            s.getDepartment().toLowerCase().includes(term)
        );
    }
}
