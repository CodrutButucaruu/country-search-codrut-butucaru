const btn = document.getElementById('toggle-theme');
const THEME_KEY = 'theme';
const DARK_CLASS = 'dark-mode';

const saved = localStorage.getItem(THEME_KEY);  
if (saved === 'dark') {
    document.body.classList.add(DARK_CLASS);
    btn.textContent = '☀️';
} else {
    btn.textContent = '🌙';
}
btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle(DARK_CLASS);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀️' : '🌙';
});