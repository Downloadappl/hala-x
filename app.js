// Hala X - تطبيق قنوات التلفزيون
// تعليمات الاستخدام:
// 1. افتح index.html في متصفح ويب
// 2. أدخل الرمز 5555 للوصول الأولي
// 3. استخدم الرمز 7171 للوصول إلى لوحة التحكم (للمطورين)
// 4. ملاحظة أمنية: الرمز 7171 غير آمن للاستخدام في بيئة الإنتاج - استخدم Firebase Authentication بدلاً منه

// تكوين Firebase
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

// تهيئة Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, push, set, remove } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// حالة التطبيق
const state = {
  channels: [],
  categories: [],
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  firstRunCompleted: localStorage.getItem('firstRunCompleted') === 'true',
  currentTheme: localStorage.getItem('currentTheme') || 'dark',
  searchQuery: '',
  exactMatch: false,
  selectedCategory: 'all',
  channelToDelete: null
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// وظيفة تهيئة التطبيق
function initializeApp() {
  // تعيين السمة المختارة
  document.body.setAttribute('data-theme', state.currentTheme);
  
  // إعداد معالجات الأحداث
  setupEventListeners();
  
  // التحقق من الوصول الأولي
  if (!state.firstRunCompleted) {
    showAccessModal();
  } else {
    hideLoadingScreen();
    loadChannels();
  }
  
  // إظهار زر المدير إذا كان مسجلاً دخوله
  if (state.isAdmin) {
    document.getElementById('adminBtn').classList.remove('hidden');
  }
  
  // تطبيق السمة المختارة
  applyTheme(state.currentTheme);
}

// إعداد معالجات الأحداث
function setupEventListeners() {
  // رمز الوصول الأولي
  document.getElementById('submitAccessCode').addEventListener('click', handleAccessCodeSubmit);
  document.getElementById('accessCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleAccessCodeSubmit();
  });
  
  // رمز المطور
  document.getElementById('showDeveloperAccess').addEventListener('click', showDeveloperModal);
  document.getElementById('submitDeveloperCode').addEventListener('click', handleDeveloperCodeSubmit);
  document.getElementById('developerCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleDeveloperCodeSubmit();
  });
  document.getElementById('backToAccess').addEventListener('click', showAccessModal);
  
  // البحث والتصفية
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('searchButton').addEventListener('click', handleSearch);
  document.getElementById('exactMatch').addEventListener('change', handleSearch);
  
  // الإعدادات
  document.getElementById('settingsBtn').addEventListener('click', showSettingsPanel);
  document.getElementById('closeSettings').addEventListener('click', hideSettingsPanel);
  
  // إدارة السمات
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', function() {
      const theme = this.getAttribute('data-theme');
      applyTheme(theme);
      
      // تحديث الخيار النشط
      document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
  
  // إجراءات الحساب
  document.getElementById('logoutAdmin').addEventListener('click', logoutAdmin);
  document.getElementById('resetFirstRun').addEventListener('click', resetFirstRun);
  
  // لوحة التحكم
  document.getElementById('adminBtn').addEventListener('click', showAdminPanel);
  document.getElementById('closeAdmin').addEventListener('click', hideAdminPanel);
  
  // علامات التبويب في لوحة التحكم
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchAdminTab(tabId);
    });
  });
  
  // نموذج إنشاء القناة
  document.getElementById('createChannelForm').addEventListener('submit', handleCreateChannel);
  
  // معاينة الصورة المصغرة
  document.getElementById('channelThumbnail').addEventListener('input', previewThumbnail);
  
  // تأكيد الحذف
  document.getElementById('confirmDelete').addEventListener('click', confirmDeleteChannel);
  document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);
  
  // إغلاق الرسائل المنبثقة
  document.getElementById('closeToast').addEventListener('click', hideToast);
}

// معالجة رمز الوصول الأولي
function handleAccessCodeSubmit() {
  const accessCode = document.getElementById('accessCode').value;
  const errorElement = document.getElementById('accessError');
  
  if (accessCode === '5555') {
    state.firstRunCompleted = true;
    localStorage.setItem('firstRunCompleted', 'true');
    hideAccessModal();
    hideLoadingScreen();
    loadChannels();
    showToast('تم الوصول بنجاح!', 'success');
  } else {
    errorElement.textContent = 'رمز الوصول غير صحيح. الرجاء المحاولة مرة أخرى.';
  }
}

// معالجة رمز المطور
function handleDeveloperCodeSubmit() {
  const developerCode = document.getElementById('developerCode').value;
  const errorElement = document.getElementById('developerError');
  
  if (developerCode === '7171') {
    state.isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    document.getElementById('adminBtn').classList.remove('hidden');
    hideDeveloperModal();
    showToast('تم تفعيل وضع المطور!', 'success');
    
    // ملاحظة أمنية: هذا النهج غير آمن للاستخدام في بيئة الإنتاج
    // في بيئة الإنتاج، استخدم Firebase Authentication للتحقق من هوية المستخدمين
    console.warn('ملاحظة أمنية: التحقق من المطور يتم على جانب العميل فقط. في بيئة الإنتاج، استخدم Firebase Authentication مع قواعد قاعدة البيانات المناسبة.');
  } else {
    errorElement.textContent = 'رمز المطور غير صحيح. الرجاء المحاولة مرة أخرى.';
  }
}

// تحميل القنوات من Firebase
function loadChannels() {
  const channelsRef = ref(database, 'channels');
  
  onValue(channelsRef, (snapshot) => {
    const data = snapshot.val();
    state.channels = [];
    
    if (data) {
      // تحويل البيانات إلى مصفوفة
      Object.keys(data).forEach(key => {
        state.channels.push({
          id: key,
          ...data[key]
        });
      });
      
      // تحديث التصنيفات
      updateCategories();
      
      // عرض القنوات
      renderChannels();
    } else {
      // لا توجد قنوات
      document.getElementById('emptyState').classList.remove('hidden');
      document.getElementById('channelsGrid').innerHTML = '';
    }
    
    // تحديث قائمة القنوات في لوحة التحكم إذا كانت مفتوحة
    if (state.isAdmin && document.getElementById('adminPanel').classList.contains('active')) {
      renderAdminChannelsList();
    }
  }, (error) => {
    console.error('Error loading channels:', error);
    showToast('حدث خطأ في تحميل القنوات', 'error');
  });
}

// تحديث قائمة التصنيفات
function updateCategories() {
  const categories = new Set();
  categories.add('all'); // إضافة خيار "الكل"
  
  state.channels.forEach(channel => {
    if (channel.category) {
      categories.add(channel.category);
    }
  });
  
  state.categories = Array.from(categories);
  renderCategoryFilters();
}

// عرض مرشحات التصنيف
function renderCategoryFilters() {
  const filtersContainer = document.querySelector('.category-filters');
  
  // إزالة الأزرار الحالية (باستثناء زر "الكل")
  const allButton = filtersContainer.querySelector('[data-category="all"]');
  filtersContainer.innerHTML = '';
  filtersContainer.appendChild(allButton);
  
  // إضافة أزرار التصنيفات
  state.categories.forEach(category => {
    if (category !== 'all') {
      const button = document.createElement('button');
      button.className = 'filter-btn';
      button.setAttribute('data-category', category);
      button.textContent = category;
      button.addEventListener('click', handleCategoryFilter);
      filtersContainer.appendChild(button);
    }
  });
  
  // تعيين النشط
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-category') === state.selectedCategory) {
      btn.classList.add('active');
    }
  });
}

// معالجة البحث
function handleSearch() {
  state.searchQuery = document.getElementById('searchInput').value.trim();
  state.exactMatch = document.getElementById('exactMatch').checked;
  renderChannels();
}

// معالجة تصفية التصنيف
function handleCategoryFilter(e) {
  const category = e.currentTarget.getAttribute('data-category');
  state.selectedCategory = category;
  
  // تحديث حالة الأزرار النشطة
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  e.currentTarget.classList.add('active');
  
  renderChannels();
}

// عرض القنوات
function renderChannels() {
  const channelsGrid = document.getElementById('channelsGrid');
  const emptyState = document.getElementById('emptyState');
  
  // تصفية القنوات بناءً على البحث والتصنيف
  let filteredChannels = state.channels;
  
  // تطبيق تصفية البحث
  if (state.searchQuery) {
    if (state.exactMatch) {
      filteredChannels = filteredChannels.filter(channel => 
        channel.title === state.searchQuery
      );
    } else {
      filteredChannels = filteredChannels.filter(channel => 
        channel.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
  }
  
  // تطبيق تصفية التصنيف
  if (state.selectedCategory !== 'all') {
    filteredChannels = filteredChannels.filter(channel => 
      channel.category === state.selectedCategory
    );
  }
  
  // عرض القنوات المصفاة أو حالة عدم وجود قنوات
  if (filteredChannels.length === 0) {
    channelsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  // إنشاء بطاقات القنوات
  channelsGrid.innerHTML = filteredChannels.map(channel => {
    const isNew = isChannelNew(channel.createdAt);
    
    return `
      <div class="channel-card ${isNew ? 'new' : ''}">
        <div class="channel-thumbnail">
          ${channel.thumbnail ? 
            `<img src="${channel.thumbnail}" alt="${channel.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"> 
             <div class="placeholder" style="display:none;"><i class="fas fa-tv"></i></div>` :
            `<div class="placeholder"><i class="fas fa-tv"></i></div>`
          }
        </div>
        <div class="channel-info">
          <h3 class="channel-title">${channel.title}</h3>
          <span class="channel-category">${channel.category || 'بدون تصنيف'}</span>
          <p class="channel-description">${channel.description || 'لا يوجد وصف'}</p>
          <div class="channel-actions">
            <button class="btn-primary watch-channel" data-url="${channel.url}">
              <i class="fas fa-play"></i> مشاهدة
            </button>
            ${state.isAdmin ? `
              <button class="btn-secondary edit-channel" data-id="${channel.id}">
                <i class="fas fa-edit"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // إضافة معالجات الأحداث للقنوات
  document.querySelectorAll('.watch-channel').forEach(button => {
    button.addEventListener('click', function() {
      const url = this.getAttribute('data-url');
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
  
  if (state.isAdmin) {
    document.querySelectorAll('.edit-channel').forEach(button => {
      button.addEventListener('click', function() {
        const channelId = this.getAttribute('data-id');
        editChannel(channelId);
      });
    });
  }
}

// التحقق مما إذا كانت القناة جديدة (تم إنشاؤها خلال آخر 7 أيام)
function isChannelNew(createdAt) {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
}

// معالجة إنشاء قناة جديدة
function handleCreateChannel(e) {
  e.preventDefault();
  
  const title = document.getElementById('channelTitle').value.trim();
  const thumbnail = document.getElementById('channelThumbnail').value.trim();
  const url = document.getElementById('channelUrl').value.trim();
  const category = document.getElementById('channelCategory').value.trim();
  const description = document.getElementById('channelDescription').value.trim();
  
  // التحقق من صحة البيانات
  if (!title || !thumbnail || !url || !category) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // التحقق من صحة الروابط
  try {
    new URL(thumbnail);
    new URL(url);
  } catch (e) {
    showToast('يرجى إدخال روابط صحيحة', 'error');
    return;
  }
  
  // إنشاء القناة
  const channelsRef = ref(database, 'channels');
  const newChannelRef = push(channelsRef);
  
  const channelData = {
    title,
    thumbnail,
    url,
    category,
    description,
    createdAt: new Date().toISOString()
  };
  
  set(newChannelRef, channelData)
    .then(() => {
      showToast('تم إنشاء القناة بنجاح!', 'success');
      document.getElementById('createChannelForm').reset();
      document.getElementById('thumbnailPreview').innerHTML = '';
    })
    .catch(error => {
      console.error('Error creating channel:', error);
      showToast('حدث خطأ في إنشاء القناة', 'error');
    });
}

// معاينة الصورة المصغرة
function previewThumbnail() {
  const thumbnailUrl = document.getElementById('channelThumbnail').value.trim();
  const preview = document.getElementById('thumbnailPreview');
  
  if (!thumbnailUrl) {
    preview.innerHTML = '';
    return;
  }
  
  // التحقق من أن الرابط صحيح
  try {
    new URL(thumbnailUrl);
  } catch (e) {
    preview.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    return;
  }
  
  preview.innerHTML = `<img src="${thumbnailUrl}" alt="معاينة الصورة" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-exclamation-triangle\\'></i>'">`;
}

// عرض قائمة القنوات في لوحة التحكم
function renderAdminChannelsList() {
  const channelsList = document.querySelector('.channels-list');
  
  if (state.channels.length === 0) {
    channelsList.innerHTML = '<p class="empty-state">لا توجد قنوات لإدارتها</p>';
    return;
  }
  
  channelsList.innerHTML = state.channels.map(channel => `
    <div class="admin-channel-item">
      <div class="admin-channel-thumb">
        ${channel.thumbnail ? 
          `<img src="${channel.thumbnail}" alt="${channel.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"> 
           <div class="placeholder" style="display:none;"><i class="fas fa-tv"></i></div>` :
          `<div class="placeholder"><i class="fas fa-tv"></i></div>`
        }
      </div>
      <div class="admin-channel-info">
        <div class="admin-channel-title">${channel.title}</div>
        <div class="admin-channel-category">${channel.category || 'بدون تصنيف'}</div>
      </div>
      <div class="admin-channel-actions">
        <button class="btn-secondary edit-channel-admin" data-id="${channel.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-danger delete-channel-admin" data-id="${channel.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  // إضافة معالجات الأحداث
  document.querySelectorAll('.edit-channel-admin').forEach(button => {
    button.addEventListener('click', function() {
      const channelId = this.getAttribute('data-id');
      editChannel(channelId);
    });
  });
  
  document.querySelectorAll('.delete-channel-admin').forEach(button => {
    button.addEventListener('click', function() {
      const channelId = this.getAttribute('data-id');
      showDeleteModal(channelId);
    });
  });
}

// تحرير القناة
function editChannel(channelId) {
  const channel = state.channels.find(c => c.id === channelId);
  if (!channel) return;
  
  // ملء النموذج ببيانات القناة
  document.getElementById('channelTitle').value = channel.title;
  document.getElementById('channelThumbnail').value = channel.thumbnail || '';
  document.getElementById('channelUrl').value = channel.url;
  document.getElementById('channelCategory').value = channel.category || '';
  document.getElementById('channelDescription').value = channel.description || '';
  
  // معاينة الصورة المصغرة
  previewThumbnail();
  
  // التبديل إلى علامة التبويب "إنشاء" (سنستخدمها للتحرير أيضًا)
  switchAdminTab('create');
  
  // تغيير النص إلى "تحديث"
  const submitButton = document.querySelector('#createChannelForm button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-save"></i> تحديث القناة';
  
  // تغيير معالج النموذج للتحديث بدلاً من الإنشاء
  const form = document.getElementById('createChannelForm');
  form.onsubmit = function(e) {
    e.preventDefault();
    updateChannel(channelId);
  };
  
  // إظهار لوحة التحكم إذا لم تكن مفتوحة
  showAdminPanel();
}

// تحديث القناة
function updateChannel(channelId) {
  const title = document.getElementById('channelTitle').value.trim();
  const thumbnail = document.getElementById('channelThumbnail').value.trim();
  const url = document.getElementById('channelUrl').value.trim();
  const category = document.getElementById('channelCategory').value.trim();
  const description = document.getElementById('channelDescription').value.trim();
  
  // التحقق من صحة البيانات
  if (!title || !thumbnail || !url || !category) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // التحقق من صحة الروابط
  try {
    new URL(thumbnail);
    new URL(url);
  } catch (e) {
    showToast('يرجى إدخال روابط صحيحة', 'error');
    return;
  }
  
  // تحديث القناة
  const channelRef = ref(database, `channels/${channelId}`);
  
  const channelData = {
    title,
    thumbnail,
    url,
    category,
    description,
    createdAt: state.channels.find(c => c.id === channelId).createdAt
  };
  
  set(channelRef, channelData)
    .then(() => {
      showToast('تم تحديث القناة بنجاح!', 'success');
      
      // إعادة تعيين النموذج
      document.getElementById('createChannelForm').reset();
      document.getElementById('thumbnailPreview').innerHTML = '';
      
      // إعادة تعيين معالج النموذج إلى الإنشاء
      const form = document.getElementById('createChannelForm');
      form.onsubmit = handleCreateChannel;
      
      // إعادة تعيين نص الزر
      const submitButton = document.querySelector('#createChannelForm button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-plus"></i> إضافة قناة';
    })
    .catch(error => {
      console.error('Error updating channel:', error);
      showToast('حدث خطأ في تحديث القناة', 'error');
    });
}

// عرض نافذة تأكيد الحذف
function showDeleteModal(channelId) {
  state.channelToDelete = channelId;
  document.getElementById('deleteModal').classList.add('active');
}

// إخفاء نافذة تأكيد الحذف
function hideDeleteModal() {
  state.channelToDelete = null;
  document.getElementById('deleteModal').classList.remove('active');
}

// تأكيد حذف القناة
function confirmDeleteChannel() {
  if (!state.channelToDelete) return;
  
  const channelRef = ref(database, `channels/${state.channelToDelete}`);
  
  remove(channelRef)
    .then(() => {
      showToast('تم حذف القناة بنجاح!', 'success');
      hideDeleteModal();
    })
    .catch(error => {
      console.error('Error deleting channel:', error);
      showToast('حدث خطأ في حذف القناة', 'error');
    });
}

// تبديل علامات التبويب في لوحة التحكم
function switchAdminTab(tabId) {
  // تحديث أزرار علامات التبويب
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    }
  });
  
  // تحديث محتوى علامات التبويب
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
    if (panel.id === `${tabId}Tab`) {
      panel.classList.add('active');
    }
  });
  
  // إذا كانت علامة التبويب "إدارة"، قم بتحديث القائمة
  if (tabId === 'manage') {
    renderAdminChannelsList();
  }
}

// تطبيق السمة
function applyTheme(theme) {
  state.currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('currentTheme', theme);
}

// تسجيل خروج المطور
function logoutAdmin() {
  state.isAdmin = false;
  localStorage.setItem('isAdmin', 'false');
  document.getElementById('adminBtn').classList.add('hidden');
  hideAdminPanel();
  hideSettingsPanel();
  showToast('تم تسجيل خروج المطور', 'success');
}

// إعادة تعيين الوصول الأولي
function resetFirstRun() {
  state.firstRunCompleted = false;
  localStorage.setItem('firstRunCompleted', 'false');
  hideSettingsPanel();
  showAccessModal();
  showToast('تم إعادة تعيين رمز الوصول', 'success');
}

// عرض وإخفاء النوافذ المنبثقة
function showAccessModal() {
  document.getElementById('accessModal').classList.add('active');
}

function hideAccessModal() {
  document.getElementById('accessModal').classList.remove('active');
}

function showDeveloperModal() {
  hideAccessModal();
  document.getElementById('developerModal').classList.add('active');
}

function hideDeveloperModal() {
  document.getElementById('developerModal').classList.remove('active');
}

function showSettingsPanel() {
  document.getElementById('settingsPanel').classList.add('active');
}

function hideSettingsPanel() {
  document.getElementById('settingsPanel').classList.remove('active');
}

function showAdminPanel() {
  document.getElementById('adminPanel').classList.add('active');
  // التبديل إلى علامة التبويب "إنشاء" افتراضيًا
  switchAdminTab('create');
}

function hideAdminPanel() {
  document.getElementById('adminPanel').classList.remove('active');
  // إعادة تعيين النموذج
  document.getElementById('createChannelForm').reset();
  document.getElementById('thumbnailPreview').innerHTML = '';
  
  // إعادة تعيين معالج النموذج إلى الإنشاء
  const form = document.getElementById('createChannelForm');
  form.onsubmit = handleCreateChannel;
  
  // إعادة تعيين نص الزر
  const submitButton = document.querySelector('#createChannelForm button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-plus"></i> إضافة قناة';
}

function hideLoadingScreen() {
  document.getElementById('loadingScreen').classList.add('hidden');
}

// عرض الرسائل المنبثقة
function showToast(message, type = 'info') {
  const toast = document.getElementById('messageToast');
  const messageElement = document.getElementById('toastMessage');
  
  messageElement.textContent = message;
  toast.className = `toast ${type} show`;
  
  // إخفاء تلقائي بعد 5 ثوانٍ
  setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  const toast = document.getElementById('messageToast');
  toast.classList.remove('show');
}

// ملاحظات أمنية للاستخدام في الإنتاج:
// 1. استبدال رمز المطور 7171 بـ Firebase Authentication
// 2. استخدام قواعد أمان Firebase Realtime Database للتحكم في الوصول
// مثال لقواعد قاعدة البيانات الآمنة:
/*
{
  "rules": {
    "channels": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
*/
