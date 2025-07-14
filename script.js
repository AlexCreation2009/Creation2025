
// Blog functionality with markdown support and multilingual interface

class BlogApp {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    this.currentLanguage = localStorage.getItem('blogLanguage') || 'en';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupLanguage();
    this.renderPosts();
  }

  setupEventListeners() {
    // Language switcher
    document.getElementById('langEn').addEventListener('click', () => this.setLanguage('en'));
    document.getElementById('langRu').addEventListener('click', () => this.setLanguage('ru'));

    // New post button
    document.getElementById('newPostBtn').addEventListener('click', () => this.openPostModal());

    // Modal controls
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    document.getElementById('cancelPost').addEventListener('click', () => this.closeModal(document.getElementById('postModal')));

    // Post form
    document.getElementById('postForm').addEventListener('submit', (e) => this.handlePostSubmit(e));

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('blogLanguage', lang);
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang${lang.charAt(0).toUpperCase() + lang.slice(1)}`).classList.add('active');
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-ru]').forEach(element => {
      element.textContent = element.getAttribute(`data-${lang}`);
    });
  }

  setupLanguage() {
    this.setLanguage(this.currentLanguage);
  }

  openPostModal() {
    document.getElementById('postModal').style.display = 'block';
    document.getElementById('postForm').reset();
  }

  closeModal(modal) {
    modal.style.display = 'none';
  }

  async handlePostSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const attachmentFiles = document.getElementById('postFiles').files;

    // Process image
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await this.fileToBase64(imageFile);
    }

    // Process attachments
    const attachments = [];
    for (let file of attachmentFiles) {
      const attachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: await this.fileToBase64(file)
      };
      attachments.push(attachment);
    }

    // Create new post
    const newPost = {
      id: Date.now(),
      title,
      content,
      imageUrl,
      attachments,
      date: new Date().toISOString(),
      comments: []
    };

    this.posts.unshift(newPost);
    this.savePosts();
    this.renderPosts();
    this.closeModal(document.getElementById('postModal'));
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  renderPosts() {
    const container = document.getElementById('posts-container');
    
    if (this.posts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
          <h3>${this.currentLanguage === 'en' ? 'No posts yet' : 'Пока нет постов'}</h3>
          <p>${this.currentLanguage === 'en' ? 'Create your first post to get started!' : 'Создайте свой первый пост!'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.posts.map(post => this.renderPostCard(post)).join('');
  }

  renderPostCard(post) {
    const excerpt = this.getTextFromMarkdown(post.content).substring(0, 150) + '...';
    const formattedDate = new Date(post.date).toLocaleDateString(
      this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US'
    );

    return `
      <article class="post-card" onclick="blogApp.openPost(${post.id})">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
        <div class="post-content">
          <h2 class="post-title">${this.escapeHtml(post.title)}</h2>
          <div class="post-meta">
            ${formattedDate} • ${post.comments.length} ${this.currentLanguage === 'en' ? 'comments' : 'комментариев'}
          </div>
          <div class="post-excerpt">${this.escapeHtml(excerpt)}</div>
          ${post.attachments.length > 0 ? `
            <div class="post-attachments">
              <strong>${this.currentLanguage === 'en' ? 'Attachments:' : 'Вложения:'}</strong>
              ${post.attachments.map(att => `
                <span class="attachment-link">${this.escapeHtml(att.name)}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  openPost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const modal = document.getElementById('postViewModal');
    const content = document.getElementById('postViewContent');
    
    const formattedDate = new Date(post.date).toLocaleDateString(
      this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US'
    );

    content.innerHTML = `
      <article class="post-full">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image" style="margin-bottom: 1rem;">` : ''}
        <h1>${this.escapeHtml(post.title)}</h1>
        <div class="post-meta" style="margin-bottom: 2rem;">${formattedDate}</div>
        <div class="markdown-content">${marked.parse(post.content)}</div>
        
        ${post.attachments.length > 0 ? `
          <div class="post-attachments" style="margin-top: 2rem;">
            <h3>${this.currentLanguage === 'en' ? 'Attachments' : 'Вложения'}</h3>
            ${post.attachments.map(att => `
              <a href="${att.data}" download="${att.name}" class="attachment-link">
                📎 ${this.escapeHtml(att.name)} (${this.formatFileSize(att.size)})
              </a>
            `).join('')}
          </div>
        ` : ''}

        <div class="comments-section">
          <h3>${this.currentLanguage === 'en' ? 'Comments' : 'Комментарии'} (${post.comments.length})</h3>
          
          <div class="comment-form">
            <form onsubmit="blogApp.addComment(event, ${post.id})">
              <div class="form-group">
                <label>${this.currentLanguage === 'en' ? 'Your name' : 'Ваше имя'}</label>
                <input type="text" name="author" required>
              </div>
              <div class="form-group">
                <label>${this.currentLanguage === 'en' ? 'Comment' : 'Комментарий'}</label>
                <textarea name="content" required placeholder="${this.currentLanguage === 'en' ? 'Write your comment...' : 'Напишите ваш комментарий...'}"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                ${this.currentLanguage === 'en' ? 'Add Comment' : 'Добавить комментарий'}
              </button>
            </form>
          </div>

          <div class="comments-list">
            ${post.comments.map(comment => `
              <div class="comment">
                <div class="comment-author">${this.escapeHtml(comment.author)}</div>
                <div class="comment-date">${new Date(comment.date).toLocaleDateString(this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US')}</div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </article>
    `;

    modal.style.display = 'block';
  }

  addComment(e, postId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const comment = {
      id: Date.now(),
      author: formData.get('author'),
      content: formData.get('content'),
      date: new Date().toISOString()
    };

    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.comments.push(comment);
      this.savePosts();
      this.openPost(postId); // Refresh the post view
    }
  }

  getTextFromMarkdown(markdown) {
    // Simple markdown to text conversion
    return markdown
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  savePosts() {
    localStorage.setItem('blogPosts', JSON.stringify(this.posts));
  }
}

// Initialize the blog app
const blogApp = new BlogApp();
