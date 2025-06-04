/* eslint-disable */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Login script loaded');
  
  // Login form
  const loginForm = document.querySelector('.form--login');
  if (loginForm) {
    console.log('Login form found');
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Login form submitted');
      
      // Get email and password
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      console.log('Attempting login with:', { email });
      
      try {
        const res = await axios({
          method: 'POST',
          url: '/api/v1/users/login',
          data: {
            email,
            password
          }
        });
        
        console.log('Login response:', res);
        
        if (res.data.status === 'success') {
          console.log('Login successful');
          // Redirect will be handled by the server
        }
      } catch (err) {
        console.error('Login error:', err.response?.data || err);
        alert('Hatalı email veya şifre');
      }
    });
  }
  
  // Password toggle
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
      }
    });
  }
});
