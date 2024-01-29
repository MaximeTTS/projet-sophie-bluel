document.addEventListener('DOMContentLoaded', function () {
  // Gestion du formulaire de connexion
  const loginForm = document.querySelector('.login__form')
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault()
      clearErrorMessages() // Appel de la fonction pour effacer les messages d'erreur
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
            if (response.status === 404) {
              updateErrorMessage('email-error-message', 'Utilisateur inexistant')
            } else if (response.status === 401) {
              updateErrorMessage('password-error-message', 'Mot de passe incorrect')
            }
            return Promise.reject(new Error('Erreur de connexion'))
          }
          return response.json()
        })
        .then((data) => {
          localStorage.setItem('userToken', data.token)
          localStorage.setItem('isLoggedIn', true)
          window.location.href = 'index.html'
        })
        .catch((error) => {
          console.error(error)
        })
    })
  }

  function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message')
    errorMessages.forEach(function (message) {
      message.innerHTML = ''
      message.style.display = 'none'
    })
  }

  function updateErrorMessage(errorElementId, message) {
    const errorElement = document.getElementById(errorElementId)
    errorElement.innerHTML = message
    errorElement.style.display = 'block'
  }

  // Mise à jour du lien de connexion/déconnexion
  const loginLink = document.querySelector('nav ul li a[href="login.html"]')
  const topBar = document.querySelector('.connexion__top__bar')
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

      // Affichez l'icône "Modifier"
      document.querySelector('.filters').style.display = 'none'
    } else {
      adminElements.forEach((el) => (el.style.display = 'none')) // Cache les éléments admin
      bodyStyle.paddingTop = '0' // Ajuste le padding du corps
      loginLink.textContent = 'Login'
      loginLink.href = 'login.html'
    }
  }

  adjustTopBarAndAdminElements()
})
