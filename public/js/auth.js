class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = null;
    this.init();
  }

  init() {
    if (this.token) {
      this.validateToken();
    }
    this.setupEventListeners();
    this.initializeTheme();
  }

  initializeTheme() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateThemeIcon(theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      if (theme === 'dark') {
        // Moon icon for dark mode
        themeIcon.innerHTML = `
          <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
        `;
      } else {
        // Sun icon for light mode
        themeIcon.innerHTML = `
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        `;
      }
    }
  }

  setupEventListeners() {
    document.getElementById('loginBtn')?.addEventListener('click', () => {
      this.showLoginModal();
    });

    document.getElementById('closeLoginModal')?.addEventListener('click', () => {
      this.hideLoginModal();
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Setup Google Sign-In
    window.handleCredentialResponse = (response) => {
      this.handleGoogleLogin(response.credential);
    };
  }

  async validateToken() {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        this.user = await response.json();
        this.updateUI();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      this.logout();
    }
  }

  async handleGoogleLogin(credential) {
    try {
      console.log('Sending Google credential to server...');
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: credential })
      });

      console.log('Server response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data.user.name);
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('authToken', this.token);
        this.updateUI();
        this.hideLoginModal();
      } else {
        const errorData = await response.json();
        console.error('Login failed with status:', response.status, errorData);
        throw new Error(`Login failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      alert(`Login failed: ${error.message}. Please try again.`);
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    this.updateUI();
  }

  updateUI() {
    const authSection = document.getElementById('authSection');
    const userStats = document.getElementById('userStats');

    if (this.user) {
      authSection.innerHTML = `
        <div class="user-info">
          <img src="${this.user.avatar}" alt="${this.user.name}" class="user-avatar">
          <span>${this.user.name}</span>
          <button onclick="auth.logout()" class="btn-secondary">Sign Out</button>
        </div>
      `;

      // Update stats
      const stats = this.user.gameStats;
      document.getElementById('origamiStats').textContent = 
        `${stats.origami.completedShapes} shapes completed`;
      document.getElementById('typingStats').textContent = 
        `${stats.speedTyping.bestWPM} WPM best`;
      document.getElementById('memoryStats').textContent = 
        `${stats.memoryGame.bestScore} best score`;

      userStats.style.display = 'block';
    } else {
      authSection.innerHTML = `
        <button id="loginBtn" class="btn-primary">Sign In</button>
      `;
      userStats.style.display = 'none';
      
      // Re-attach event listener
      document.getElementById('loginBtn')?.addEventListener('click', () => {
        this.showLoginModal();
      });
    }
  }

  showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
  }

  hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
}

// Initialize auth manager
const auth = new AuthManager();