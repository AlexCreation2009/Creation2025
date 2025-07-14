
// Language translations
const translations = {
    en: {
        title: "Blog Site",
        blog_title: "My Blog",
        new_post: "New Post",
        create_post: "Create New Post",
        post_title: "Post Title",
        post_content: "Post Content",
        upload_image: "Upload Image:",
        upload_files: "Upload Files:",
        publish: "Publish",
        cancel: "Cancel",
        comments: "Comments",
        add_comment: "Add Comment",
        your_name: "Your Name",
        comment_placeholder: "Write your comment...",
        attached_files: "Attached Files",
        no_comments: "No comments yet. Be the first to comment!",
        posted_on: "Posted on"
    },
    ru: {
        title: "Блог Сайт",
        blog_title: "Мой Блог",
        new_post: "Новый Пост",
        create_post: "Создать Новый Пост",
        post_title: "Заголовок Поста",
        post_content: "Содержание Поста",
        upload_image: "Загрузить Изображение:",
        upload_files: "Загрузить Файлы:",
        publish: "Опубликовать",
        cancel: "Отмена",
        comments: "Комментарии",
        add_comment: "Добавить Комментарий",
        your_name: "Ваше Имя",
        comment_placeholder: "Напишите ваш комментарий...",
        attached_files: "Прикрепленные Файлы",
        no_comments: "Пока нет комментариев. Будьте первым!",
        posted_on: "Опубликовано"
    }
};

let currentLanguage = 'en';
let posts = [];
let nextPostId = 1;

// Initialize the blog
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
    updateLanguage();
});

function setupEventListeners() {
    const postForm = document.getElementById('postForm');
    postForm.addEventListener('submit', handlePostSubmit);
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(lang + '-btn').classList.add('active');
    
    updateLanguage();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
    
    // Update document title
    document.title = translations[currentLanguage].title;
    
    // Re-render posts to update language
    renderPosts();
}

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
    document.getElementById('postTitle').focus();
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
    document.getElementById('postForm').reset();
}

function handlePostSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const files = Array.from(document.getElementById('postFiles').files);
    
    const post = {
        id: nextPostId++,
        title: title,
        content: content,
        date: new Date().toISOString(),
        image: imageFile ? URL.createObjectURL(imageFile) : null,
        files: files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size
        })),
        comments: []
    };
    
    posts.unshift(post);
    savePosts();
    renderPosts();
    hideNewPostForm();
}

function addComment(postId) {
    const nameInput = document.getElementById(`comment-name-${postId}`);
    const textInput = document.getElementById(`comment-text-${postId}`);
    
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    
    if (!name || !text) {
        alert('Please fill in both name and comment fields.');
        return;
    }
    
    const comment = {
        id: Date.now(),
        name: name,
        text: text,
        date: new Date().toISOString()
    };
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(comment);
        savePosts();
        renderPosts();
    }
    
    nameInput.value = '';
    textInput.value = '';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderPosts() {
    const postsContainer = document.getElementById('blogPosts');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="post">
                <div class="post-content">
                    <h2>Welcome to your blog!</h2>
                    <p>Click "New Post" to create your first blog post.</p>
                </div>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <article class="post">
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : ''}
            <div class="post-content">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    ${translations[currentLanguage].posted_on} ${formatDate(post.date)}
                </div>
                <div class="post-text">${post.content}</div>
                
                ${post.files.length > 0 ? `
                    <div class="post-files">
                        <h4>${translations[currentLanguage].attached_files}</h4>
                        <div class="file-list">
                            ${post.files.map(file => `
                                <a href="${file.url}" class="file-item" download="${file.name}">
                                    ${file.name} (${formatFileSize(file.size)})
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="comments-section">
                    <h3>${translations[currentLanguage].comments} (${post.comments.length})</h3>
                    
                    <div class="comment-form">
                        <input type="text" id="comment-name-${post.id}" placeholder="${translations[currentLanguage].your_name}">
                        <textarea id="comment-text-${post.id}" placeholder="${translations[currentLanguage].comment_placeholder}"></textarea>
                        <button onclick="addComment(${post.id})" class="btn btn-primary">${translations[currentLanguage].add_comment}</button>
                    </div>
                    
                    <div class="comments-list">
                        ${post.comments.length === 0 ? 
                            `<p>${translations[currentLanguage].no_comments}</p>` :
                            post.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-author">${comment.name}</div>
                                    <div class="comment-date">${formatDate(comment.date)}</div>
                                    <div class="comment-text">${comment.text}</div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function savePosts() {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

function loadPosts() {
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
        // Update nextPostId to avoid conflicts
        nextPostId = Math.max(...posts.map(p => p.id), 0) + 1;
    }
    renderPosts();
}

// Make functions globally available
window.showNewPostForm = showNewPostForm;
window.hideNewPostForm = hideNewPostForm;
window.switchLanguage = switchLanguage;
window.addComment = addComment;
