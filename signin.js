let userData =localStorage.getItem('logingInfo');

try {
    userData = userData ? JSON.parse(userData) : null;
} catch (e) {
    console.error('Error parsing userData:', e);
    userData = null;
}   