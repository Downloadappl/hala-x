/**
 * ============================================
 * Hala X - Channels App
 * Complete Frontend Application with Firebase Integration
 * ============================================
 * 
 * USAGE INSTRUCTIONS:
 * 1. Firebase Configuration is already provided below
 * 2. Open index.html in a modern web browser
 * 3. Enter access code 5555 on first run
 * 4. For admin panel, enter developer code 7171
 * 5. Admin features: Create, Edit, Delete channels
 * 
 * SECURITY NOTES FOR PRODUCTION:
 * - This implementation uses client-side codes (5555, 7171) for authentication
 * - This is NOT secure for production use
 * - For production, implement:
 *   1. Firebase Authentication with proper user management
 *   2. Firebase Realtime Database Rules to restrict write access
 *   3. Server-side verification of admin status
 *   4. HTTPS-only connections
 *   5. Rate limiting on API calls
 * 
 * RECOMMENDED FIREBASE RULES (for production):
 * {
 *   "rules": {
 *     "channels": {
 *       ".read": true,
 *       ".write": "root.child('admins').child(auth.uid).exists()",
 *       "$channelId": {
 *         ".validate": "newData.hasChildren(['id', 'title', 'thumbnail', 'url', 'category', 'description', 'createdAt'])"
 *       }
 *     }
 *   }
 * }
 */

// ============================================
// Firebase Configuration
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyB3crsDcJI1qYipy6awM6VIoAamLC51zi4",
    authDomain: "cinmanryo.firebaseapp.com",
    databaseURL: "https://cinmanryo-default-rtdb.firebaseio.com",
    projectId: "cinmanryo",
    storageBucket: "cinmanryo.appspot.com",
    messagingSenderId: "605207743179",
    appId: "1:605207743179:web:0bb0b6efdd208e9094a94e",
    measurementId: "G-SH32EZ7ZY6"
};

// ============================================
// Initialize Firebase
// ============================================
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log('✅ Firebase initialized successfully');

// ============================================
// Constants
// ============================================
const ACCESS_CODE = '5555';
const ADMIN_CODE = '7171';
const FIRST_RUN_FLAG = 'hala_x_first_run_passed';
const ADMIN_FLAG = 'hala_x_admin_mode';

// ============================================
// State Management
// ============================================
let appState = {
    isFirstRunPassed: localStorage.getItem(FIRST_RUN_FLAG) === 'true',
    isAdminMode: sessionStorage.getItem(ADMIN_FLAG) === 'true',
    channels: [],
    filteredChannels: [],
    currentEditingChannelId: null,
    currentDeleteChannelId: null
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Modals
    accessCodeModal: document.getElementById('accessCodeModal'),
    adminCodeModal: document.getElementById('adminCodeModal'),
    adminPanel: document.getElementById('adminPanel'),
    editChannelModal: document.getElementById('editChannelModal'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    
    // Access Code Modal
    accessCodeInput: document.getElementById('accessCodeInput'),
    accessCodeError: document.getElementById('accessCodeError'),
    accessCodeSubmitBtn: document.getElementById('accessCodeSubmitBtn'),
    
    // Admin Code Modal
    adminCodeInput: document.getElementById('adminCodeInput'),
    adminCodeError: document.getElementById('adminCodeError'),
    adminCodeSubmitBtn: document.getElementById('adminCodeSubmitBtn'),
    adminCodeCancelBtn: document.getElementById('adminCodeCancelBtn'),
    
    // Admin Panel
    closeAdminBtn: document.getElementById('closeAdminBtn'),
    createChannelForm: document.getElementById('createChannelForm'),
    createChannelMessage: document.getElementById('createChannelMessage'),
    channelsTableBody: document.getElementById('channelsTableBody'),
    logoutAdminBtn: document.getElementById('logoutAdminBtn'),
    resetFirstRunBtn: document.getElementById('resetFirstRunBtn'),
    
    // Edit Channel Modal
    editChannelForm: document.getElementById('editChannelForm'),
    editChannelId: document.getElementById('editChannelId'),
    editChannelTitle: document.getElementById('editChannelTitle'),
    editChannelThumbnail: document.getElementById('editChannelThumbnail'),
    editChannelUrl: document.getElementById('editChannelUrl'),
    editChannelCategory: document.getElementById('editChannelCategory'),
    editChannelDescription: document.getElementById('editChannelDescription'),
    editThumbnailPreview: document.getElementById('editThumbnailPreview'),
    closeEditModal: document.getElementById('closeEditModal'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    
    // Delete Confirm Modal
    deleteChannelId: document.getElementById('deleteChannelId'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    
    // Main Content
    channelsGrid: document.getElementById('channelsGrid'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    adminToggleBtn: document.getElementById('adminToggleBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    exactMatchToggle: document.getElementById('exactMatchToggle'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    
    // Create Channel Form Fields
    channelTitle: document.getElementById('channelTitle'),
    channelThumbnail: document.getElementById('channelThumbnail'),
    channelUrl: document.getElementById('channelUrl'),
    channelCategory: document.getElementById('channelCategory'),
    channelDescription: document.getElementById('channelDescription'),
    thumbnailPreview: document.getElementById('thumbnailPreview')
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App initialized');
    
    // Check if first run is passed
    if (!appState.isFirstRunPassed) {
        showModal(elements.accessCodeModal);
        console.log('📋 Showing first-run access code modal');
    } else {
        console.log('✅ First-run already passed');
        initializeApp();
    }
    
    // Set up event listeners
    setupEventListeners();
});

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Access Code Modal
    elements.accessCodeSubmitBtn.addEventListener('click', handleAccessCodeSubmit);
    elements.accessCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAccessCodeSubmit();
    });
    
    // Admin Code Modal
    elements.adminCodeSubmitBtn.addEventListener('click', handleAdminCodeSubmit);
    elements.adminCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdminCodeSubmit();
    });
    elements.adminCodeCancelBtn.addEventListener('click', () => hideModal(elements.adminCodeModal));
    
    // Admin Panel
    elements.closeAdminBtn.addEventListener('click', () => hideModal(elements.adminPanel));
    elements.createChannelForm.addEventListener('submit', handleCreateChannel);
    elements.logoutAdminBtn.addEventListener('click', handleLogoutAdmin);
    elements.resetFirstRunBtn.addEventListener('click', handleResetFirstRun);
    
    // Edit Channel Modal
    elements.closeEditModal.addEventListener('click', () => hideModal(elements.editChannelModal));
    elements.cancelEditBtn.addEventListener('click', () => hideModal(elements.editChannelModal));
    elements.editChannelForm.addEventListener('submit', handleEditChannelSubmit);
    
    // Delete Confirm Modal
    elements.cancelDeleteBtn.addEventListener('click', () => hideModal(elements.deleteConfirmModal));
    elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    
    // Main Content
    elements.adminToggleBtn.addEventListener('click', handleAdminToggle);
    elements.searchBtn.addEventListener('click', applyFilters);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    elements.categoryFilter.addEventListener('change', applyFilters);
    elements.exactMatchToggle.addEventListener('change', applyFilters);
    elements.resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Thumbnail Preview
    elements.channelThumbnail.addEventListener('change', updateThumbnailPreview);
    elements.editChannelThumbnail.addEventListener('change', updateEditThumbnailPreview);
    
    console.log('✅ Event listeners set up');
}

// ============================================
// Access Code Handling
// ============================================
function handleAccessCodeSubmit() {
    const code = elements.accessCodeInput.value.trim();
    
    if (code === ACCESS_CODE) {
        // Correct code
        localStorage.setItem(FIRST_RUN_FLAG, 'true');
        appState.isFirstRunPassed = true;
        hideModal(elements.accessCodeModal);
        initializeApp();
        showMessage(elements.createChannelMessage, 'مرحباً بك في Hala X!', 'success');
        console.log('✅ Access code verified');
    } else {
        // Wrong code
        elements.accessCodeError.textContent = 'رمز الوصول غير صحيح. حاول مرة أخرى.';
        elements.accessCodeError.style.display = 'block';
        elements.accessCodeInput.value = '';
        console.warn('❌ Invalid access code entered');
    }
}

// ============================================
// Admin Code Handling
// ============================================
function handleAdminCodeSubmit() {
    const code = elements.adminCodeInput.value.trim();
    
    if (code === ADMIN_CODE) {
        // Correct admin code
        sessionStorage.setItem(ADMIN_FLAG, 'true');
        appState.isAdminMode = true;
        hideModal(elements.adminCodeModal);
        showModal(elements.adminPanel);
        loadChannelsForAdmin();
        showMessage(elements.createChannelMessage, 'مرحباً بك في لوحة التحكم الإدارية!', 'success');
        console.log('✅ Admin code verified - Admin mode activated');
    } else {
        // Wrong code
        elements.adminCodeError.textContent = 'رمز المطور غير صحيح.';
        elements.adminCodeError.style.display = 'block';
        elements.adminCodeInput.value = '';
        console.warn('❌ Invalid admin code entered');
    }
}

// ============================================
// Admin Toggle
// ============================================
function handleAdminToggle() {
    if (appState.isAdminMode) {
        // Already in admin mode - close panel
        hideModal(elements.adminPanel);
    } else {
        // Show admin code modal
        elements.adminCodeError.style.display = 'none';
        elements.adminCodeInput.value = '';
        showModal(elements.adminCodeModal);
        console.log('📋 Admin code modal shown');
    }
}

// ============================================
// Initialize App (After First Run)
// ============================================
function initializeApp() {
    console.log('🔄 Initializing app...');
    loadChannels();
}

// ============================================
// Firebase - Load Channels
// ============================================
function loadChannels() {
    console.log('📥 Loading channels from Firebase...');
    
    const channelsRef = database.ref('channels');
    
    // Set up realtime listener
    channelsRef.on('value', (snapshot) => {
        appState.channels = [];
        
        snapshot.forEach((childSnapshot) => {
            const channel = childSnapshot.val();
            channel.firebaseKey = childSnapshot.key;
            appState.channels.push(channel);
        });
        
        console.log(`✅ Loaded ${appState.channels.length} channels`);
        applyFilters();
    }, (error) => {
        console.error('❌ Error loading channels:', error);
        showErrorMessage('خطأ في تحميل القنوات. تحقق من اتصال الإنترنت.');
    });
}

// ============================================
// Firebase - Load Channels for Admin
// ============================================
function loadChannelsForAdmin() {
    console.log('📥 Loading channels for admin...');
    
    const channelsRef = database.ref('channels');
    
    channelsRef.on('value', (snapshot) => {
        const channels = [];
        
        snapshot.forEach((childSnapshot) => {
            const channel = childSnapshot.val();
            channel.firebaseKey = childSnapshot.key;
            channels.push(channel);
        });
        
        console.log(`✅ Loaded ${channels.length} channels for admin`);
        renderChannelsTable(channels);
    });
}

// ============================================
// Render Channels Grid
// ============================================
function renderChannelsGrid(channels) {
    console.log(`🎨 Rendering ${channels.length} channels`);
    
    if (channels.length === 0) {
        elements.channelsGrid.innerHTML = '<div class="empty-message">لا توجد قنوات متطابقة.</div>';
        return;
    }
    
    elements.channelsGrid.innerHTML = channels.map(channel => {
        const isNew = isChannelNew(channel.createdAt);
        const newBadge = isNew ? '<span class="channel-badge new">جديد</span>' : '';
        
        return `
            <div class="channel-card">
                <div class="channel-thumbnail">
                    <img src="${channel.thumbnail}" alt="${channel.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22%2394a3b8%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage Not Found%3C/text%3E%3C/svg%3E'">
                    ${newBadge}
                </div>
                <div class="channel-info">
                    <h3 class="channel-title">${escapeHtml(channel.title)}</h3>
                    <span class="channel-category">${escapeHtml(channel.category)}</span>
                    <p class="channel-description">${escapeHtml(channel.description)}</p>
                    <div class="channel-actions">
                        <button class="btn-visit" onclick="visitChannel('${escapeHtml(channel.url)}')">
                            زيارة القناة →
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Render Channels Table (Admin)
// ============================================
function renderChannelsTable(channels) {
    console.log(`📊 Rendering admin table with ${channels.length} channels`);
    
    if (channels.length === 0) {
        elements.channelsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">لا توجد قنوات حتى الآن.</td></tr>';
        return;
    }
    
    elements.channelsTableBody.innerHTML = channels.map(channel => `
        <tr>
            <td>${escapeHtml(channel.title)}</td>
            <td>${escapeHtml(channel.category)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openEditModal('${channel.firebaseKey}')">تعديل</button>
                    <button class="btn-delete" onclick="openDeleteModal('${channel.firebaseKey}')">حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// Create Channel
// ============================================
function handleCreateChannel(e) {
    e.preventDefault();
    
    const title = elements.channelTitle.value.trim();
    const thumbnail = elements.channelThumbnail.value.trim();
    const url = elements.channelUrl.value.trim();
    const category = elements.channelCategory.value.trim();
    const description = elements.channelDescription.value.trim();
    
    // Validation
    if (!title || !thumbnail || !url || !category) {
        showMessage(elements.createChannelMessage, 'يرجى ملء جميع الحقول المطلوبة.', 'error');
        console.warn('❌ Form validation failed');
        return;
    }
    
    if (!isValidUrl(thumbnail) || !isValidUrl(url)) {
        showMessage(elements.createChannelMessage, 'يرجى إدخال روابط صحيحة.', 'error');
        console.warn('❌ URL validation failed');
        return;
    }
    
    // Create channel object
    const newChannel = {
        id: generateId(),
        title,
        thumbnail,
        url,
        category,
        description,
        createdAt: new Date().toISOString()
    };
    
    // Push to Firebase
    const channelsRef = database.ref('channels');
    channelsRef.push(newChannel)
        .then(() => {
            console.log('✅ Channel created successfully');
            showMessage(elements.createChannelMessage, 'تم إضافة القناة بنجاح!', 'success');
            
            // Reset form
            elements.createChannelForm.reset();
            elements.thumbnailPreview.innerHTML = '';
        })
        .catch((error) => {
            console.error('❌ Error creating channel:', error);
            showMessage(elements.createChannelMessage, 'خطأ في إضافة القناة. حاول مرة أخرى.', 'error');
        });
}

// ============================================
// Edit Channel
// ============================================
function openEditModal(firebaseKey) {
    const channel = appState.channels.find(ch => ch.firebaseKey === firebaseKey);
    
    if (!channel) {
        console.error('❌ Channel not found');
        return;
    }
    
    appState.currentEditingChannelId = firebaseKey;
    
    elements.editChannelId.value = firebaseKey;
    elements.editChannelTitle.value = channel.title;
    elements.editChannelThumbnail.value = channel.thumbnail;
    elements.editChannelUrl.value = channel.url;
    elements.editChannelCategory.value = channel.category;
    elements.editChannelDescription.value = channel.description;
    
    // Show thumbnail preview
    if (channel.thumbnail) {
        elements.editThumbnailPreview.innerHTML = `<img src="${channel.thumbnail}" alt="preview">`;
    }
    
    showModal(elements.editChannelModal);
    console.log('📝 Edit modal opened for channel:', channel.title);
}

function handleEditChannelSubmit(e) {
    e.preventDefault();
    
    const firebaseKey = elements.editChannelId.value;
    const title = elements.editChannelTitle.value.trim();
    const thumbnail = elements.editChannelThumbnail.value.trim();
    const url = elements.editChannelUrl.value.trim();
    const category = elements.editChannelCategory.value.trim();
    const description = elements.editChannelDescription.value.trim();
    
    // Validation
    if (!title || !thumbnail || !url || !category) {
        alert('يرجى ملء جميع الحقول المطلوبة.');
        return;
    }
    
    if (!isValidUrl(thumbnail) || !isValidUrl(url)) {
        alert('يرجى إدخال روابط صحيحة.');
        return;
    }
    
    // Get original channel to preserve createdAt
    const originalChannel = appState.channels.find(ch => ch.firebaseKey === firebaseKey);
    
    const updatedChannel = {
        id: originalChannel.id,
        title,
        thumbnail,
        url,
        category,
        description,
        createdAt: originalChannel.createdAt
    };
    
    // Update in Firebase
    const channelRef = database.ref(`channels/${firebaseKey}`);
    channelRef.set(updatedChannel)
        .then(() => {
            console.log('✅ Channel updated successfully');
            hideModal(elements.editChannelModal);
            showMessage(elements.createChannelMessage, 'تم تحديث القناة بنجاح!', 'success');
        })
        .catch((error) => {
            console.error('❌ Error updating channel:', error);
            alert('خطأ في تحديث القناة. حاول مرة أخرى.');
        });
}

// ============================================
// Delete Channel
// ============================================
function openDeleteModal(firebaseKey) {
    appState.currentDeleteChannelId = firebaseKey;
    elements.deleteChannelId.value = firebaseKey;
    showModal(elements.deleteConfirmModal);
    console.log('🗑️ Delete confirmation modal opened');
}

function handleConfirmDelete() {
    const firebaseKey = elements.deleteChannelId.value;
    
    const channelRef = database.ref(`channels/${firebaseKey}`);
    channelRef.remove()
        .then(() => {
            console.log('✅ Channel deleted successfully');
            hideModal(elements.deleteConfirmModal);
            showMessage(elements.createChannelMessage, 'تم حذف القناة بنجاح!', 'success');
        })
        .catch((error) => {
            console.error('❌ Error deleting channel:', error);
            alert('خطأ في حذف القناة. حاول مرة أخرى.');
        });
}

// ============================================
// Admin Logout
// ============================================
function handleLogoutAdmin() {
    sessionStorage.removeItem(ADMIN_FLAG);
    appState.isAdminMode = false;
    hideModal(elements.adminPanel);
    console.log('🚪 Admin mode deactivated');
    alert('تم تسجيل الخروج من الإدارة.');
}

// ============================================
// Reset First Run
// ============================================
function handleResetFirstRun() {
    if (confirm('هل تريد حقاً إعادة تعيين الوصول الأول؟ سيتم طلب رمز الوصول عند إعادة التحميل.')) {
        localStorage.removeItem(FIRST_RUN_FLAG);
        appState.isFirstRunPassed = false;
        console.log('🔄 First-run flag reset');
        location.reload();
    }
}

// ============================================
// Search and Filter
// ============================================
function applyFilters() {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();
    const selectedCategory = elements.categoryFilter.value;
    const exactMatch = elements.exactMatchToggle.checked;
    
    console.log(`🔍 Applying filters - Search: "${searchTerm}", Category: "${selectedCategory}", Exact: ${exactMatch}`);
    
    appState.filteredChannels = appState.channels.filter(channel => {
        // Category filter
        if (selectedCategory && channel.category !== selectedCategory) {
            return false;
        }
        
        // Search filter
        if (searchTerm) {
            const channelTitle = channel.title.toLowerCase();
            if (exactMatch) {
                // Exact match
                if (channelTitle !== searchTerm) {
                    return false;
                }
            } else {
                // Partial match
                if (!channelTitle.includes(searchTerm)) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    renderChannelsGrid(appState.filteredChannels);
    console.log(`✅ Filtered to ${appState.filteredChannels.length} channels`);
}

function resetFilters() {
    elements.searchInput.value = '';
    elements.categoryFilter.value = '';
    elements.exactMatchToggle.checked = false;
    applyFilters();
    console.log('🔄 Filters reset');
}

// ============================================
// Visit Channel
// ============================================
function visitChannel(url) {
    console.log(`🔗 Opening channel: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ============================================
// Thumbnail Preview
// ============================================
function updateThumbnailPreview() {
    const url = elements.channelThumbnail.value.trim();
    
    if (!url) {
        elements.thumbnailPreview.innerHTML = '';
        return;
    }
    
    if (!isValidUrl(url)) {
        elements.thumbnailPreview.innerHTML = '<span style="color: #ef4444;">رابط غير صحيح</span>';
        return;
    }
    
    elements.thumbnailPreview.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='<span style=\\"color: #ef4444;\\">لم يتمكن من تحميل الصورة</span>'">`;
    console.log('🖼️ Thumbnail preview updated');
}

function updateEditThumbnailPreview() {
    const url = elements.editChannelThumbnail.value.trim();
    
    if (!url) {
        elements.editThumbnailPreview.innerHTML = '';
        return;
    }
    
    if (!isValidUrl(url)) {
        elements.editThumbnailPreview.innerHTML = '<span style="color: #ef4444;">رابط غير صحيح</span>';
        return;
    }
    
    elements.editThumbnailPreview.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='<span style=\\"color: #ef4444;\\">لم يتمكن من تحميل الصورة</span>'">`;
    console.log('🖼️ Edit thumbnail preview updated');
}

// ============================================
// Modal Utilities
// ============================================
function showModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    console.log('📋 Modal shown');
}

function hideModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    console.log('📋 Modal hidden');
}

// ============================================
// Message Display
// ============================================
function showMessage(element, message, type = 'success') {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
    
    console.log(`💬 Message: ${message}`);
}

function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '2000';
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
    
    console.error(`❌ Error: ${message}`);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if a channel is new (created within last 7 days)
 */
function isChannelNew(createdAt) {
    if (!createdAt) return false;
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
    
    return daysDiff <= 7;
}

/**
 * Generate unique ID
 */
function generateId() {
    return 'ch_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Console Logging
// ============================================
console.log('%c🎬 Hala X - Channels App Loaded', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cVersion: 1.0.0', 'color: #64748b;');
console.log('%cAccess Code: 5555 | Admin Code: 7171', 'color: #ec4899; font-weight: bold;');
console.log('%cNote: This is a development build. For production, implement proper authentication and Firebase rules.', 'color: #ef4444;');
