// ============================================================
//  Kinetic Creations — script.js
// ============================================================

// ---- Mobile Menu ----
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mob-link, .mob-hire').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ---- Navbar scroll shadow ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
});

// ---- Active Nav Link on Scroll ----
function updateActiveLink() {
  const sections = ['home', 'designs', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        current = id;
      }
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

// ---- Lightbox ----
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');

function openLightbox(src, caption) {
  lbImg.src = src;
  lbImg.alt = caption;
  lbCaption.textContent = caption;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ---- Contact Form — WhatsApp redirect ----
function sendMessage() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const feedback = document.getElementById('form-msg');

  // Basic validation
  if (!name || !email || !message) {
    feedback.textContent = '⚠ Please fill in Name, Email and Message.';
    feedback.className = 'form-feedback error';
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    feedback.textContent = '⚠ Please enter a valid email address.';
    feedback.className = 'form-feedback error';
    return;
  }

  // Build WhatsApp message
  const waText = encodeURIComponent(
    `Hi Kinetic Creations! 👋\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'General Enquiry'}\n\nMessage:\n${message}`
  );
  const waURL = `https://wa.me/9779820758238?text=${waText}`;

  feedback.textContent = '✓ Redirecting to WhatsApp…';
  feedback.className = 'form-feedback';

  setTimeout(() => {
    window.open(waURL, '_blank');
    // Reset form
    document.getElementById('cf-name').value = '';
    document.getElementById('cf-email').value = '';
    document.getElementById('cf-subject').value = '';
    document.getElementById('cf-message').value = '';
    feedback.textContent = '';
  }, 700);
}

// ---- Scroll Reveal (lightweight) ----
const revealEls = document.querySelectorAll(
  '.about-profile-card, .about-skills-card, .contact-info-panel, .contact-form-card'
);

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.1}s, transform 0.55s ease ${i * 0.1}s, box-shadow 0.25s ease`;
});

// Design cards revealed separately with stagger
const designCards = document.querySelectorAll('.design-card');
designCards.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.45s ease ${(i % 6) * 0.06}s, transform 0.45s ease ${(i % 6) * 0.06}s, box-shadow 0.25s ease`;
});

function revealOnScroll() {
  [...revealEls, ...designCards].forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 50) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  });
}

window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load', revealOnScroll);
