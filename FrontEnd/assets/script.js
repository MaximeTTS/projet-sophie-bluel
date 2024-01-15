document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.querySelector('.gallery')
  const allWorks = [] // Garder une liste de tous les travaux pour faciliter le filtrage

  // Fonction pour créer un élément figure
  function createFigure(work) {
    const figure = document.createElement('figure')
    const image = document.createElement('img')
    image.src = work.imageUrl
    image.alt = work.title
    figure.appendChild(image)

    const figcaption = document.createElement('figcaption')
    figcaption.textContent = work.title
    figure.appendChild(figcaption)

    return figure
  }

  // Fonction pour afficher les travaux dans la galerie
  function displayWorks(works) {
    galleryContainer.innerHTML = '' // Videz la galerie avant d'ajouter les nouveaux travaux
    works.forEach((work) => {
      const figure = createFigure(work)
      galleryContainer.appendChild(figure)
    })
  }

  // Fonction pour normaliser une chaîne de caractères (pour le filtrage)
  function normalizeString(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/\s+/g, ' ')
      .replace('&', 'and')
      .toLowerCase()
      .trim()
  }

  // Fonction pour filtrer les travaux par catégorie
  function filterWorks(category) {
    const normalizedCategory = normalizeString(category)
    if (category === 'Tous') {
      displayWorks(allWorks)
    } else {
      const filteredWorks = allWorks.filter((work) => {
        const normalizedWorkCategory = normalizeString(work.category.name)
        return normalizedWorkCategory === normalizedCategory
      })

      console.log(`Travaux filtrés pour la catégorie : '${category}'`, filteredWorks)
      displayWorks(filteredWorks)
    }
  }

  // Récupération des travaux depuis l'API
  fetch('http://localhost:5678/api/works')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then((works) => {
      allWorks.push(...works) // Ajoutez tous les travaux à la liste
      displayWorks(allWorks) // Affichez tous les travaux dans la galerie
    })
    .catch((error) => console.error('Error fetching works:', error))

  // Ajout d'écouteurs d'événements sur les boutons de filtre
  document.querySelectorAll('.btn__filters').forEach((button) => {
    button.addEventListener('click', () => {
      // Enlevez la classe 'btn__filters--selected' de tous les boutons
      document.querySelectorAll('.btn__filters').forEach((btn) => {
        btn.classList.remove('btn__filters--selected')
      })

      // Ajoutez la classe 'btn__filters--selected' au bouton cliqué
      button.classList.add('btn__filters--selected')

      // Appelez filterWorks avec le texte du bouton
      filterWorks(button.textContent)
    })
  })

  // Gestion de l'état de connexion
  const loginLink = document.querySelector('nav ul li a[href="login.html"]')
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  if (isLoggedIn) {
    loginLink.textContent = 'Logout'
    loginLink.href = '#'
    loginLink.addEventListener('click', (e) => {
      e.preventDefault()
      localStorage.removeItem('userToken')
      localStorage.removeItem('isLoggedIn')
      window.location.href = 'login.html'
    })

    // Affichez l'icône "Modifier"
    document.querySelector('.filters').style.display = 'none'
    document.getElementById('editButton').style.display = 'block'
  } else {
    loginLink.textContent = 'Login'
    loginLink.href = 'login.html'
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const updateWorksButton = document.getElementById('update-works')
  const closeButtonFirstWindow = document.getElementById('button__to__close__first__window')
  const closeButtonSecondWindow = document.getElementById('button__to__close__second__window')
  const arrowReturn = document.getElementById('arrow__return')
  const dialog = document.getElementById('dialog')
  const addButton = document.getElementById('dialog__edit__add')
  const dialogGallery = document.getElementById('dialog__gallery')
  const dialogEdit = document.getElementById('dialog__edit')

  function resetDialog() {
    dialogGallery.style.display = 'block' // Afficher la première fenêtre
    dialogEdit.style.display = 'none' // Masquer la seconde fenêtre
  }

  function hideDialog() {
    dialog.style.display = 'none' // Masquer le dialog
    resetDialog() // Réinitialiser l'état du dialogue
  }

  updateWorksButton.addEventListener('click', function () {
    dialog.style.display = 'flex' // Afficher le dialog
    resetDialog() // Réinitialiser l'état du dialogue
  })

  closeButtonFirstWindow.addEventListener('click', hideDialog)

  addButton.addEventListener('click', function () {
    dialogGallery.style.display = 'none' // Masquer la première fenêtre
    dialogEdit.style.display = 'block' // Afficher la seconde fenêtre
  })

  closeButtonSecondWindow.addEventListener('click', hideDialog)

  arrowReturn.addEventListener('click', function (e) {
    e.preventDefault() // Empêcher le comportement par défaut du lien
    resetDialog() // Revenir à l'état initial du dialogue
  })
})
