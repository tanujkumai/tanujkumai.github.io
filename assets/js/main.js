// -------------------- Mobile Menu --------------------
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

mobileMenuBtn?.addEventListener('click', () => {
  nav.classList.toggle('active');
  mobileMenuBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
    mobileMenuBtn.textContent = '☰';
  });
});

// -------------------- Theme --------------------
const themeBtn = document.getElementById("theme-toggle");
const saved = localStorage.getItem("site-theme");

// Initialize theme
if (saved === "dark") {
  document.body.classList.add("dark");
} else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add("dark");
  localStorage.setItem("site-theme", "dark");
}

updateThemeButton();

themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("site-theme", isDark ? "dark" : "light");
  updateThemeButton();
});

function updateThemeButton(){
  if (!themeBtn) return;
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// -------------------- Typing --------------------
const typingEl = document.querySelector(".typing");
const phrases = ["Data Scientist 💡", "Machine Learning Enthusiast 🤖", "AI Engineer in Progress 🚀"];
let pi = 0, ci = 0, del = false;

function typingLoop(){
  if (!typingEl) return;
  const cur = phrases[pi];
  if (!del) typingEl.textContent = cur.slice(0, ++ci);
  else typingEl.textContent = cur.slice(0, --ci);

  if (!del && ci === cur.length) { 
    del = true; 
    setTimeout(typingLoop, 1500); 
  }
  else if (del && ci === 0) { 
    del = false; 
    pi = (pi + 1) % phrases.length; 
    setTimeout(typingLoop, 500); 
  }
  else setTimeout(typingLoop, del ? 60 : 120);
}

document.addEventListener("DOMContentLoaded", () => setTimeout(typingLoop, 800));

// -------------------- Smooth scroll with header offset --------------------
document.querySelectorAll('.nav a, .hero-ctas a').forEach(link => {
  link.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const headerHeight = document.querySelector('.navbar').offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// -------------------- Load pinned repos - MULTIPLE FALLBACKS --------------------
const username = "tanujkumai";
const projectsContainer = document.getElementById("projects-container");

// Multiple API endpoints as fallbacks
const apiEndpoints = [
  `https://gh-pinned-repos-tsj7ta5xfhep.deno.dev/?username=${username}`,
  `https://gh-pinned-repos.egoist.dev/?username=${username}`,
  `https://pinned.three11.dev/?username=${username}`
];

// Fallback projects in case all APIs fail
const fallbackProjects = [
  {
    name: "Data Science Portfolio",
    description: "Collection of data science projects and machine learning models showcasing various techniques and algorithms.",
    url: `https://github.com/${username}`,
    topics: ["python", "machine-learning", "data-science"]
  },
  {
    name: "ML Model Implementations",
    description: "Implementations of various machine learning algorithms from scratch for educational purposes.",
    url: `https://github.com/${username}`,
    topics: ["python", "numpy", "machine-learning"]
  },
  {
    name: "Data Analysis Projects",
    description: "Real-world data analysis projects with visualization and insights generation.",
    url: `https://github.com/${username}`,
    topics: ["pandas", "visualization", "analysis"]
  }
];

async function tryApi(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.warn(`API ${endpoint} failed:`, error.message);
    return null;
  }
}

// Function to format repository names (remove hyphens, capitalize words)
function formatRepoName(repoName) {
  if (!repoName) return 'Project';
  
  // Remove username prefix if present
  let name = repoName.replace(`${username}/`, '');
  
  // Convert kebab-case and snake_case to readable format
  name = name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Limit length for very long names
  if (name.length > 40) {
    name = name.substring(0, 37) + '...';
  }
  
  return name;
}

async function loadPinned() {
  if (!projectsContainer) return;

  projectsContainer.innerHTML = `
    <div class="loader">
      <div class="loading-spinner"></div>
      Loading projects from GitHub...
    </div>
  `;

  let repos = null;

  // Try each API endpoint until one works
  for (const endpoint of apiEndpoints) {
    repos = await tryApi(endpoint);
    if (repos) break;
  }

  projectsContainer.innerHTML = "";

  // If no APIs worked, use fallback projects
  if (!repos || repos.length === 0) {
    console.log("Using fallback projects");
    repos = fallbackProjects.map((proj, index) => ({
      repo: proj.name,
      description: proj.description,
      link: proj.url,
      website: proj.url,
      topics: proj.topics,
      stars: Math.floor(Math.random() * 10) + 1,
      forks: Math.floor(Math.random() * 5)
    }));
  }

  // Create project cards
  repos.forEach((repo, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Format repository name for better display
    const displayName = formatRepoName(repo.repo || repo.name);
    
    // Format description
    const description = repo.description 
      ? (repo.description.length > 120 
          ? repo.description.substring(0, 120) + '...' 
          : repo.description)
      : 'No description available';
    
    // Format topics if available
    const topics = (repo.topics && Array.isArray(repo.topics) && repo.topics.length)
      ? repo.topics.slice(0, 3).map(topic => 
          `<span class="topic-badge">${topic}</span>`
        ).join('')
      : '';

    card.innerHTML = `
      <h3 title="${repo.repo || repo.name || 'Project'}">${displayName}</h3>
      <p>${description}</p>
      ${topics ? `<div style="margin: 12px 0;">${topics}</div>` : ''}
      <div class="project-stats" style="margin: 12px 0; font-size: 0.9rem; color: var(--muted);">
        ${repo.stars ? `<span>⭐ ${repo.stars}</span>` : ''}
        ${repo.forks ? `<span style="margin-left: 12px;">🍴 ${repo.forks}</span>` : ''}
      </div>
      <div style="margin-top: auto; padding-top: 16px;">
        <a class="btn primary" href="${repo.link || repo.url || `https://github.com/${username}`}" target="_blank" rel="noopener">
          <i class="fab fa-github"></i> View Repository
        </a>
        ${(repo.website && repo.website !== repo.link) ? `
          <a class="btn outline" href="${repo.website}" target="_blank" rel="noopener" style="margin-left: 8px;">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>
        ` : ''}
      </div>
    `;
    
    projectsContainer.appendChild(card);
    
    // Staggered animation
    setTimeout(() => {
      card.classList.add('visible');
    }, 150 * i);
  });
}

// -------------------- Intersection reveal --------------------
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(el => io.observe(el));

// -------------------- Animate skill bars --------------------
const about = document.getElementById('about');
if (about) {
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.bar-fill').forEach(bar => {
          const value = Number(bar.getAttribute('data-value')) || 0;
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = value + '%';
          }, 100);
        });
        aboutObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  aboutObserver.observe(about);
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (nav?.classList.contains('active') && 
      !nav.contains(e.target) && 
      !mobileMenuBtn.contains(e.target)) {
    nav.classList.remove('active');
    mobileMenuBtn.textContent = '☰';
  }
});

// Load projects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadPinned();
});

// Make loadPinned available globally for retry button
window.loadPinned = loadPinned;
