document.addEventListener('DOMContentLoaded', function(){
// Frontend JS for the EVA landing page
document.addEventListener('DOMContentLoaded', function(){
  // set copyright year
  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if (el) el.textContent = y;

  // simple listener for CTA that scrolls to features when hash is how or features
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')){
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth',block:'start'});
        }
      }
    })
  });

  console.log('EVA landing JS loaded');
});
