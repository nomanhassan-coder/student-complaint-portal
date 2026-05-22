/**
 * Complaint Service
 */
class ComplaintService {
    #storage;

    constructor(storageService) {
        this.#storage = storageService;
    }

    createComplaint(studentId, title, description, category) {
        if (!title || title.trim().length === 0) throw new Error('Title is required');
        if (!description || description.trim().length < 10)
            throw new Error('Description must be at least 10 characters');

        const complaints = this.#storage.getComplaints();
        const id         = this.#storage.generateId(complaints);
        const complaint  = new Complaint(id, studentId, title.trim(), description.trim(), category);

        complaints.push(complaint.toJSON());
        this.#storage.saveComplaints(complaints);
        return complaint;
    }

    getAllComplaints() {
        return this.#storage.getComplaints().map(data => Complaint.fromJSON(data));
    }

    getComplaintsByStudent(studentId) {
        // FIX BUG-04 (shared): coerce both sides to String for safe comparison
        return this.getAllComplaints().filter(
            c => String(c.getStudentId()) === String(studentId)
        );
    }

    getComplaintById(complaintId) {
        return this.getAllComplaints().find(c => c.getId() === complaintId);
    }

    updateComplaintStatus(complaintId, newStatus, adminNotes = '') {
        const complaints = this.#storage.getComplaints();
        const index      = complaints.findIndex(c => c.id === complaintId);
        if (index === -1) throw new Error('Complaint not found');

        const complaint = Complaint.fromJSON(complaints[index]);
        complaint.setStatus(newStatus);

        // FIX BUG-11: always update notes so admin can clear them
        complaint.setAdminNotes(adminNotes ?? '');

        complaints[index] = complaint.toJSON();
        this.#storage.saveComplaints(complaints);
        return complaint;
    }

    deleteComplaint(complaintId) {
        const complaints         = this.#storage.getComplaints();
        const filteredComplaints = complaints.filter(c => c.id !== complaintId);
        if (complaints.length === filteredComplaints.length) throw new Error('Complaint not found');
        this.#storage.saveComplaints(filteredComplaints);
        return true;
    }

    getComplaintsByStatus(status) {
        return this.getAllComplaints().filter(c => c.getStatus() === status);
    }

    getComplaintsByCategory(category) {
        return this.getAllComplaints().filter(c => c.getCategory() === category);
    }

    getStatistics() {
        const complaints = this.getAllComplaints();
        return {
            total:      complaints.length,
            pending:    complaints.filter(c => c.getStatus() === Complaint.STATUS.PENDING).length,
            inProgress: complaints.filter(c => c.getStatus() === Complaint.STATUS.IN_PROGRESS).length,
            resolved:   complaints.filter(c => c.getStatus() === Complaint.STATUS.RESOLVED).length,
            rejected:   complaints.filter(c => c.getStatus() === Complaint.STATUS.REJECTED).length,
            byCategory: this.#getCountByCategory(complaints)
        };
    }

    #getCountByCategory(complaints) {
        const categories = {};
        Object.values(Complaint.CATEGORIES).forEach(cat => {
            categories[cat] = complaints.filter(c => c.getCategory() === cat).length;
        });
        return categories;
    }

    searchComplaints(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) return this.getAllComplaints();
        const term = searchTerm.toLowerCase();
        return this.getAllComplaints().filter(c =>
            c.getTitle().toLowerCase().includes(term)      ||
            c.getDescription().toLowerCase().includes(term)||
            c.getCategory().toLowerCase().includes(term)   ||
            c.getStatus().toLowerCase().includes(term)
        );
    }
}
