document.addEventListener('DOMContentLoaded', function () {
  // Gestion du formulaire de connexion
  const loginForm = document.querySelector('.login__form')
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erreur dans l’identifiant ou le mot de passe')
          }
          return response.json()
        })
        .then((data) => {
          localStorage.setItem('userToken', data.token)
          localStorage.setItem('isLoggedIn', true)
          window.location.href = 'index.html'
        })
        .catch((error) => {
          alert(error.message)
        })
    })
  }

  // Mise à jour du lien de connexion/déconnexion
  const loginLink = document.querySelector('nav ul li a[href="login.html"]')
  const topBar = document.querySelector('.top__bar__css')
  const adminElements = document.querySelectorAll('.connexion')
  const bodyStyle = document.body.style
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  function adjustTopBarAndAdminElements() {
    if (isLoggedIn) {
      topBar.style.display = 'flex' // Affiche la top-bar
      adminElements.forEach((el) => (el.style.display = 'block')) // Affiche les éléments admin
      bodyStyle.paddingTop = '60px' // Ajuste le padding du corps
      loginLink.textContent = 'Logout'
      loginLink.href = '#'
      loginLink.addEventListener('click', function (e) {
        e.preventDefault()
        localStorage.removeItem('userToken')
        localStorage.removeItem('isLoggedIn')
        window.location.href = 'login.html'
      })
    } else {
      topBar.style.display = 'none' // Cache la top-bar
      adminElements.forEach((el) => (el.style.display = 'none')) // Cache les éléments admin
      bodyStyle.paddingTop = '0' // Ajuste le padding du corps
      loginLink.textContent = 'Login'
      loginLink.href = 'login.html'
    }
  }
  adjustTopBarAndAdminElements()
})
