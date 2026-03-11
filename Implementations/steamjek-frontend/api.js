const API_BASE_URL = 'http://localhost:3000/api';

// Utility for making authenticated fetch requests
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('steamjek_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || 'Request failed', 'e');
      return null;
    }

    return data;
  } catch (err) {
    showToast('Network error. Is the backend running?', 'e');
    return null;
  }
}

// Global Auth State Management
const Auth = {
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data) {
      localStorage.setItem('steamjek_token', data.token);
      localStorage.setItem('steamjek_user', JSON.stringify(data.user));
    }
    return data;
  },
  
  register: async (name, email, password, address) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, address }),
    });
    return data;
  },

  logout: () => {
    localStorage.removeItem('steamjek_token');
    localStorage.removeItem('steamjek_user');
    window.location.href = 'page1_store.html';
  },

  getUser: () => {
    const userStr = localStorage.getItem('steamjek_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('steamjek_token')
};

// Updates the sidebar user pill with real user data
function updateSidebarUser() {
  const user = Auth.getUser();
  const pill = document.getElementById('user-context');
  if (!pill) return;

  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    pill.innerHTML = `
      <div class="user-pill" style="cursor:pointer" onclick="Auth.logout()">
        <div class="u-av">${initials}</div>
        <div>
          <div class="u-name">${user.name}</div>
          <div class="u-bal">Click to logout</div>
        </div>
      </div>`;
  } else {
    pill.innerHTML = `
      <a href="page1_store.html" class="user-pill">
        <div class="u-av">?</div>
        <div>
          <div class="u-name">Not Logged In</div>
          <div class="u-bal">Click to login</div>
        </div>
      </a>`;
  }
}

// Global Toast Utility
function showToast(msg, type = 'i') {
  let container = document.getElementById('toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toasts';
    container.className = 'toasts';
    document.body.appendChild(container);
  }
  
  const el = document.createElement('div');
  el.className = `tst ${type}`;
  let icon = 'ℹ️';
  if (type === 's') icon = '✅';
  if (type === 'r') icon = '🗑️';
  if (type === 'e') icon = '❌'; 
  
  el.innerHTML = `<span>${icon}</span>${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Updates Cart and Wishlist badges across the sidebar and topbar
async function updateBadges() {
  if (!Auth.isAuthenticated()) return;

  try {
    // We could fetch both in parallel
    const [cart, wish] = await Promise.all([
      apiFetch('/cart').catch(() => []),
      apiFetch('/wishlist').catch(() => [])
    ]);

    if (cart) {
      const cartCounts = document.querySelectorAll('.cart-dot, #cart-count, #cart-badge');
      cartCounts.forEach(el => el.textContent = cart.length);
      // Also update sidebar cart badge if exists
      const sbCart = document.querySelector('a[href="page3_cart.html"] .nav-badge');
      if (sbCart) sbCart.textContent = cart.length;
    }

    if (wish) {
      const wishCounts = document.querySelectorAll('#nb, #wish-count');
      wishCounts.forEach(el => el.textContent = wish.length);
      // Also update sidebar wishlist badge if exists
      const sbWish = document.querySelector('a[href="page5_wishlist.html"] .nav-badge');
      if (sbWish) sbWish.textContent = wish.length;
    }
  } catch (err) {
    console.error("Error updating badges:", err);
  }
}

// Auto update sidebar and badges on every page that includes this script
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarUser();
  updateBadges();
});
