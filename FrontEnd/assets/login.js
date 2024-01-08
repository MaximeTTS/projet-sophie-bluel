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
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  if (isLoggedIn) {
    loginLink.textContent = 'Logout'
    loginLink.href = '#'
    loginLink.addEventListener('click', function (e) {
      e.preventDefault()
      localStorage.removeItem('userToken')
      localStorage.removeItem('isLoggedIn')
      window.location.href = 'login.html'
    })

    // Ajoutez ici la logique pour afficher les boutons d'action si nécessaire
  } else {
    loginLink.textContent = 'Login'
    loginLink.href = 'login.html'
  }
})
