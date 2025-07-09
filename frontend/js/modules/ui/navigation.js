/**
 * Navigation Module
 * Handles mobile menu functionality and section switching
 */

import { UI_CONFIG, STORAGE_KEYS } from '../../core/config.js';

/**
 * Navigation Manager Class
 */
export class NavigationManager {
    constructor() {
        this.initialized = false;
        this.currentSection = 'dashboard';
        this.mobileMenuOpen = false;
    }

    /**
     * Initialize the navigation manager
     */
    async initialize() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.setupMobileMenuToggle();
        this.restoreLastSection();
        this.initialized = true;
        console.log('Navigation Manager initialized');
    }

    /**
     * Setup event listeners for navigation functionality
     */
    setupEventListeners() {
        // Listen for window resize to handle mobile menu
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Listen for hash changes for URL navigation
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Setup navigation link clicks
        this.setupNavigationLinks();
    }

    /**
     * Setup mobile menu toggle functionality
     */
    setupMobileMenuToggle() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
    }

    /**
     * Setup navigation link click handlers
     */
    setupNavigationLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = this.getSectionIdFromLink(link);
                if (sectionId) {
                    this.showSection(sectionId);
                }
            });
        });
    }

    /**
     * Get section ID from navigation link
     * @param {Element} link - Navigation link element
     * @returns {string|null} Section ID
     */
    getSectionIdFromLink(link) {
        // Check href attribute first
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            return href.substring(1);
        }

        // Check onclick attribute
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes('showSection')) {
            const match = onclick.match(/showSection\(['"]([^'"]+)['"]\)/);
            if (match) {
                return match[1];
            }
        }

        // Check data attributes
        const sectionId = link.dataset.section;
        if (sectionId) {
            return sectionId;
        }

        return null;
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const navList = document.getElementById('navList');
        const toggleButton = document.querySelector('.mobile-menu-toggle i');
        
        if (!navList || !toggleButton) return;

        navList.classList.toggle('active');
        this.mobileMenuOpen = navList.classList.contains('active');
        
        // Change icon
        if (this.mobileMenuOpen) {
            toggleButton.className = 'fas fa-times';
        } else {
            toggleButton.className = 'fas fa-bars';
        }

        console.log('Mobile menu toggled:', this.mobileMenuOpen ? 'open' : 'closed');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const navList = document.getElementById('navList');
        const toggleButton = document.querySelector('.mobile-menu-toggle i');
        
        if (!navList || !toggleButton) return;

        navList.classList.remove('active');
        toggleButton.className = 'fas fa-bars';
        this.mobileMenuOpen = false;
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Close mobile menu on larger screens
        if (window.innerWidth > UI_CONFIG.mobileBreakpoint) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle hash change navigation
     */
    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== this.currentSection) {
            this.showSection(hash);
        }
    }

    /**
     * Show a specific section
     * @param {string} sectionId - ID of the section to show
     */
    async showSection(sectionId, force = false) {
        try {
            if (!force && sectionId === this.currentSection) {
                console.log('Already on section:', sectionId);
                return;
            }
            
            console.log('Navigating to section:', sectionId);

            // Hide all sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => section.classList.remove('active'));
            
            // Remove active class from nav links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Show selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                this.currentSection = sectionId;
            } else {
                console.warn(`Section with ID '${sectionId}' not found`);
                return;
            }
            
            // Add active class to corresponding nav link
            this.setActiveNavLink(sectionId);
            
            // Close mobile menu on mobile devices
            if (window.innerWidth <= UI_CONFIG.mobileBreakpoint) {
                this.closeMobileMenu();
            }
            
            // Update URL hash
            this.updateURLHash(sectionId);
            
            // Save current section for restoration
            this.saveCurrentSection(sectionId);
            
            // Trigger section-specific logic
            this.handleSectionSpecificLogic(sectionId);

        } catch (error) {
            console.error(`Error navigating to section '${sectionId}':`, error);
        }
    }

    /**
     * Set active navigation link
     * @param {string} sectionId - Section ID
     */
    setActiveNavLink(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSectionId = this.getSectionIdFromLink(link);
            if (linkSectionId === sectionId) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Update URL hash
     * @param {string} sectionId - Section ID
     */
    updateURLHash(sectionId) {
        if (window.location.hash !== `#${sectionId}`) {
            window.history.pushState(null, null, `#${sectionId}`);
        }
    }

    /**
     * Save current section to localStorage
     * @param {string} sectionId - Section ID
     */
    saveCurrentSection(sectionId) {
        try {
            localStorage.setItem(STORAGE_KEYS.lastVisitedSection, sectionId);
        } catch (error) {
            console.warn('Failed to save current section to localStorage:', error);
        }
    }

    /**
     * Restore last visited section from localStorage
     */
    restoreLastSection() {
        const lastSection = localStorage.getItem(STORAGE_KEYS.lastVisitedSection);
        this.currentSection = lastSection || 'dashboard';
        console.log('Restored section:', this.currentSection);
        
        // Don't call showSection here directly.
        // The main script will call it after all modules are initialized.
    }

    /**
     * Handle section-specific logic
     * @param {string} sectionId - ID of the section we're navigating to
     */
    async handleSectionSpecificLogic(sectionId) {
        const appManager = window.appManager;
        
        switch (sectionId) {
            case 'dashboard':
                console.log('Navigating to dashboard - updating data');
                const dashboardManager = appManager?.getModule?.('dashboardManager');
                if (dashboardManager) {
                    dashboardManager.updateDashboard();
                }
                break;
                
            case 'attendance':
                console.log('Navigating to attendance - loading today\'s data');
                const attendanceManager = appManager?.getModule?.('attendanceManager');
                if (attendanceManager) {
                    await attendanceManager.loadAttendanceForDate();
                }
                break;
                
            case 'registration':
                console.log('Navigating to registration - displaying students list');
                const studentManager = appManager?.getModule?.('studentManager');
                if (studentManager && studentManager.displayStudentsList) {
                    studentManager.displayStudentsList();
                }
                
                // Show student list by default, hide form
                const studentsListContainer = document.getElementById('studentsListContainer');
                const studentRegistrationForm = document.getElementById('studentRegistrationForm');
                if (studentsListContainer && studentRegistrationForm) {
                    studentsListContainer.style.display = 'block';
                    studentRegistrationForm.style.display = 'none';
                }
                break;
                
            case 'reports':
                console.log('Navigating to reports section');
                const reportsManager = appManager?.getModule?.('reportsManager');
                if (reportsManager && reportsManager.updateReportClassDropdown) {
                    reportsManager.updateReportClassDropdown();
                }
                break;
                
            case 'settings':
                console.log('Navigating to settings section');
                const settingsManager = appManager?.getModule?.('settingsManager');
                if (settingsManager) {
                    if (settingsManager.displayClasses) {
                        settingsManager.displayClasses();
                    }
                    if (settingsManager.displayHolidays) {
                        settingsManager.displayHolidays();
                    }
                    if (settingsManager.displayAcademicYearStart) {
                        settingsManager.displayAcademicYearStart();
                    }
                }
                break;
                
            default:
                console.log(`No specific logic for section: ${sectionId}`);
        }
    }

    /**
     * Setup registration section display
     */
    setupRegistrationSection() {
        const studentsListContainer = document.getElementById('studentsListContainer');
        const studentRegistrationForm = document.getElementById('studentRegistrationForm');
        
        if (studentsListContainer && studentRegistrationForm) {
            studentsListContainer.style.display = 'block';
            studentRegistrationForm.style.display = 'none';
        }
    }

    /**
     * Get current section
     * @returns {string} Current section ID
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Check if mobile menu is open
     * @returns {boolean} Whether mobile menu is open
     */
    isMobileMenuOpen() {
        return this.mobileMenuOpen;
    }

    /**
     * Navigate to specific section (public method)
     * @param {string} sectionId - Section ID
     */
    navigateTo(sectionId) {
        this.showSection(sectionId);
    }

    /**
     * Add navigation item
     * @param {Object} navItem - Navigation item configuration
     */
    addNavigationItem(navItem) {
        const { id, label, icon, order = 999 } = navItem;
        
        const navList = document.getElementById('navList');
        if (!navList) return;

        const navLink = document.createElement('a');
        navLink.href = `#${id}`;
        navLink.className = 'nav-link';
        navLink.dataset.section = id;
        navLink.innerHTML = `${icon ? `<i class="${icon}"></i>` : ''} ${label}`;

        // Add event listener
        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection(id);
        });

        // Insert at correct position based on order
        const existingLinks = Array.from(navList.children);
        let insertBefore = null;
        
        for (const link of existingLinks) {
            const linkOrder = parseInt(link.dataset.order || '999');
            if (order < linkOrder) {
                insertBefore = link;
                break;
            }
        }

        if (insertBefore) {
            navList.insertBefore(navLink, insertBefore);
        } else {
            navList.appendChild(navLink);
        }

        console.log('Navigation item added:', { id, label, icon, order });
    }

    /**
     * Remove navigation item
     * @param {string} sectionId - Section ID to remove
     */
    removeNavigationItem(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSectionId = this.getSectionIdFromLink(link);
            if (linkSectionId === sectionId) {
                link.remove();
                console.log('Navigation item removed:', sectionId);
            }
        });
    }

    /**
     * Update navigation item
     * @param {string} sectionId - Section ID
     * @param {Object} updates - Updates to apply
     */
    updateNavigationItem(sectionId, updates) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSectionId = this.getSectionIdFromLink(link);
            if (linkSectionId === sectionId) {
                if (updates.label !== undefined) {
                    const icon = link.querySelector('i');
                    const iconHTML = icon ? icon.outerHTML : '';
                    link.innerHTML = `${iconHTML} ${updates.label}`;
                }
                if (updates.icon !== undefined) {
                    const icon = link.querySelector('i');
                    if (icon) {
                        icon.className = updates.icon;
                    } else if (updates.icon) {
                        link.innerHTML = `<i class="${updates.icon}"></i> ${link.textContent}`;
                    }
                }
                console.log('Navigation item updated:', sectionId, updates);
            }
        });
    }

    /**
     * Show navigation loading state
     * @param {string} sectionId - Section ID
     */
    showNavigationLoading(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSectionId = this.getSectionIdFromLink(link);
            if (linkSectionId === sectionId) {
                link.classList.add('loading');
                const icon = link.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-spinner fa-spin';
                }
            }
        });
    }

    /**
     * Hide navigation loading state
     * @param {string} sectionId - Section ID
     */
    hideNavigationLoading(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSectionId = this.getSectionIdFromLink(link);
            if (linkSectionId === sectionId) {
                link.classList.remove('loading');
                // Restore original icon - this would need to be stored somewhere
            }
        });
    }

    /**
     * Shutdown the navigation manager
     */
    shutdown() {
        this.initialized = false;
        this.currentSection = 'dashboard';
        this.mobileMenuOpen = false;
        console.log('Navigation Manager shutdown');
    }
}

// Create and export singleton instance
export const navigationManager = new NavigationManager();

// Export functions for backward compatibility with HTML onclick handlers
export const toggleMobileMenu = () => navigationManager.toggleMobileMenu();
export const showSection = (sectionId, force = false) => navigationManager.showSection(sectionId, force);
export const navigateTo = (sectionId) => navigationManager.navigateTo(sectionId);
export const getCurrentSection = () => navigationManager.getCurrentSection();
export const closeMobileMenu = () => navigationManager.closeMobileMenu();