// Database Adapter for Madani Maktab
// Lightweight solution for 1000+ students with automatic fallback

class DatabaseAdapter {
    constructor() {
        this.useDatabase = this.checkDatabaseSupport();
        this.dbReady = false;
        this.initializeStorage();
    }

    checkDatabaseSupport() {
        // Check if IndexedDB is supported (more capacity than localStorage)
        return typeof indexedDB !== 'undefined';
    }

    async initializeStorage() {
        if (this.useDatabase) {
            await this.initIndexedDB();
        }
        this.dbReady = true;
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MadaniMaktabDB', 1);
            
            request.onerror = () => {
                console.warn('IndexedDB failed, falling back to localStorage');
                this.useDatabase = false;
                resolve();
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Students store
                if (!db.objectStoreNames.contains('students')) {
                    db.createObjectStore('students', { keyPath: 'id' });
                }
                
                // Attendance store
                if (!db.objectStoreNames.contains('attendance')) {
                    db.createObjectStore('attendance', { keyPath: 'date' });
                }
                
                // Classes store
                if (!db.objectStoreNames.contains('classes')) {
                    db.createObjectStore('classes', { keyPath: 'name' });
                }
                
                // Holidays store
                if (!db.objectStoreNames.contains('holidays')) {
                    db.createObjectStore('holidays', { keyPath: 'date' });
                }
            };
        });
    }

    async waitForReady() {
        while (!this.dbReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async getStudents() {
        await this.waitForReady();
        
        if (this.useDatabase) {
            return await this.getFromIndexedDB('students');
        } else {
            return JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
        }
    }

    async saveStudents(students) {
        await this.waitForReady();
        
        if (this.useDatabase) {
            await this.saveToIndexedDB('students', students);
        } else {
            localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
        }
    }

    async getAttendance() {
        await this.waitForReady();
        
        if (this.useDatabase) {
            const data = await this.getFromIndexedDB('attendance');
            return data || {};
        } else {
            return JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};
        }
    }

    async saveAttendance(attendance) {
        await this.waitForReady();
        
        if (this.useDatabase) {
            await this.saveToIndexedDB('attendance', attendance);
        } else {
            localStorage.setItem('madaniMaktabAttendance', JSON.stringify(attendance));
        }
    }

    async getClasses() {
        await this.waitForReady();
        
        if (this.useDatabase) {
            const data = await this.getFromIndexedDB('classes');
            return data || ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        } else {
            return JSON.parse(localStorage.getItem('madaniMaktabClasses')) || ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        }
    }

    async saveClasses(classes) {
        await this.waitForReady();
        
        if (this.useDatabase) {
            await this.saveToIndexedDB('classes', classes);
        } else {
            localStorage.setItem('madaniMaktabClasses', JSON.stringify(classes));
        }
    }

    async getHolidays() {
        await this.waitForReady();
        
        if (this.useDatabase) {
            const data = await this.getFromIndexedDB('holidays');
            return data || [];
        } else {
            return JSON.parse(localStorage.getItem('madaniMaktabHolidays')) || [];
        }
    }

    async saveHolidays(holidays) {
        await this.waitForReady();
        
        if (this.useDatabase) {
            await this.saveToIndexedDB('holidays', holidays);
        } else {
            localStorage.setItem('madaniMaktabHolidays', JSON.stringify(holidays));
        }
    }

    async getFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(storeName + '_data');

                request.onsuccess = () => {
                    resolve(request.result ? request.result.data : null);
                };

                request.onerror = () => {
                    resolve(null); // Return null instead of rejecting
                };
            } catch (error) {
                resolve(null); // Return null for any errors
            }
        });
    }

    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ 
                id: storeName + '_data', 
                data: data 
            });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    getStorageInfo() {
        if (this.useDatabase) {
            return {
                type: 'IndexedDB',
                capacity: 'Several GB (suitable for 1000+ students)',
                persistent: true,
                multiDevice: false
            };
        } else {
            return {
                type: 'localStorage',
                capacity: '5-10MB (suitable for 200-300 students)',
                persistent: true,
                multiDevice: false
            };
        }
    }
}

// Global database adapter instance
const dbAdapter = new DatabaseAdapter();