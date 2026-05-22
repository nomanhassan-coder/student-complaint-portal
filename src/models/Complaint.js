/**
 * Complaint Model
 * Demonstrates: Encapsulation, Data Validation
 *
 * FIX BUG-01: Static methods cannot write private (#) fields of another instance.
 * Solution: constructor accepts an optional _restore object; fromJSON passes saved
 * values through it so all private fields are correctly initialised.
 */
class Complaint {
    #id;
    #studentId;
    #title;
    #description;
    #category;
    #status;
    #createdAt;
    #updatedAt;
    #adminNotes;

    static STATUS = {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        RESOLVED: 'Resolved',
        REJECTED: 'Rejected'
    };

    static CATEGORIES = {
        TRANSPORT: 'Transport',
        FACILITIES: 'Facilities',
        ACADEMICS: 'Academics',
        HOSTEL: 'Hostel',
        OTHER: 'Other'
    };

    // _restore is an internal-only parameter used exclusively by fromJSON
    constructor(id, studentId, title, description, category = 'Other', _restore = null) {
        this.#id = id;
        this.#studentId = studentId;
        this.#title = title;
        this.#description = description;
        this.#category = category;

        if (_restore) {
            // Restoring from storage — use saved values
            this.#status     = _restore.status     || Complaint.STATUS.PENDING;
            this.#createdAt  = _restore.createdAt  || new Date().toISOString();
            this.#updatedAt  = _restore.updatedAt  || new Date().toISOString();
            this.#adminNotes = _restore.adminNotes || '';
        } else {
            // Brand-new complaint
            this.#status     = Complaint.STATUS.PENDING;
            this.#createdAt  = new Date().toISOString();
            this.#updatedAt  = new Date().toISOString();
            this.#adminNotes = '';
        }
    }

    // Getters
    getId()          { return this.#id; }
    getStudentId()   { return this.#studentId; }
    getTitle()       { return this.#title; }
    getDescription() { return this.#description; }
    getCategory()    { return this.#category; }
    getStatus()      { return this.#status; }
    getCreatedAt()   { return this.#createdAt; }
    getUpdatedAt()   { return this.#updatedAt; }
    getAdminNotes()  { return this.#adminNotes; }

    // Status management with validation
    setStatus(newStatus) {
        const validStatuses = Object.values(Complaint.STATUS);
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        this.#status    = newStatus;
        this.#updatedAt = new Date().toISOString();
    }

    setAdminNotes(notes) {
        this.#adminNotes = notes;
        this.#updatedAt  = new Date().toISOString();
    }

    canBeEdited() {
        return this.#status === Complaint.STATUS.PENDING;
    }

    // Convert to storage format
    toJSON() {
        return {
            id:          this.#id,
            studentId:   this.#studentId,
            title:       this.#title,
            description: this.#description,
            category:    this.#category,
            status:      this.#status,
            createdAt:   this.#createdAt,
            updatedAt:   this.#updatedAt,
            adminNotes:  this.#adminNotes
        };
    }

    // FIX BUG-01: use _restore param — private fields are set inside the constructor
    static fromJSON(data) {
        return new Complaint(
            data.id,
            data.studentId,
            data.title,
            data.description,
            data.category,
            {
                status:     data.status     || Complaint.STATUS.PENDING,
                createdAt:  data.createdAt,
                updatedAt:  data.updatedAt,
                adminNotes: data.adminNotes || ''
            }
        );
    }
}
