// Voting Instructions Logic
const acceptCheckbox = document.getElementById('accept');
const continueBtn = document.getElementById('continue-btn');

// Check authentication
const voterToken = sessionStorage.getItem('voter-token');
if (!voterToken) {
  window.location.href = '/voter-login';
}

// Enable continue button when checkbox is checked
acceptCheckbox.addEventListener('change', () => {
  continueBtn.disabled = !acceptCheckbox.checked;
});

// Continue to voting
continueBtn.addEventListener('click', () => {
  if (acceptCheckbox.checked) {
    window.location.href = '/voting';
  }
});
