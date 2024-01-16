document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.querySelector('.gallery')
  const allWorks = [] // Garder une liste de tous les travaux pour faciliter le filtrage
  const dialog = document.getElementById('dialog')
  const updateWorksButton = document.getElementById('update-works')
  const dialogEdit = document.getElementById('dialog__edit')

  document.getElementById('dialog__edit__work__form').addEventListener('submit', function (e) {
    e.preventDefault()

    const title = document.getElementById('form__title').value
    const category = document.getElementById('form__category').value
    const imageInput = document.getElementById('form__image')

    if (!title || !category) {
      alert('Le titre et la catégorie sont obligatoires.')
      return
    }

    if (imageInput.files.length === 0) {
      alert('Veuillez sélectionner une image.')
      return
    }

    const newWork = {
      title: title,
      imageUrl: URL.createObjectURL(imageInput.files[0]),
      category: { name: category },
    }

    allWorks.push(newWork)
    displayWorks(allWorks)

    // Mettre à jour la liste déroulante des catégories
    updateCategoryDropdown(allWorks)

    dialog.style.display = 'none'
    document.getElementById('dialog__edit__work__form').reset()
  })

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
    galleryContainer.innerHTML = ''
    works.forEach((work) => {
      const figure = createFigure(work)
      galleryContainer.appendChild(figure)
    })
  }

  function displayWorksInDialog(works) {
    const dialogGalleryContent = document.getElementById('dialog__gallery').querySelector('.dialog__content')
    dialogGalleryContent.innerHTML = ''

    works.forEach((work, index) => {
      // Créez un élément <figure>
      const figure = document.createElement('figure')
      figure.setAttribute('data-id', work.id)

      // Créez un élément <div> pour contenir l'image et les icônes
      const container = document.createElement('div')
      container.style.position = 'relative'

      // Créez un élément <i> pour l'icône de la corbeille
      const trashIcon = document.createElement('i')
      trashIcon.classList.add('fas', 'fa-trash-can')
      container.appendChild(trashIcon)

      // Ajoutez un gestionnaire d'événements pour l'icône de la corbeille
      trashIcon.addEventListener('click', function () {
        // Appelez une fonction pour supprimer la photo
        deletePhoto(work.id)
      })

      // Créez un élément <img> pour afficher l'image
      const image = document.createElement('img')
      image.src = work.imageUrl
      image.alt = 'Image'
      container.appendChild(image)

      // Si c'est la première itération (index = 0), ajoutez l'icône Move
      if (index === 0) {
        const iconMove = document.createElement('i')
        iconMove.classList.add('fas', 'fa-arrows-up-down-left-right', 'custom-icon')
        iconMove.style.color = '#ffffff'
        container.appendChild(iconMove)
      }

      // Créez un élément <a> avec le texte "Éditer"
      const editLink = document.createElement('a')
      editLink.textContent = 'éditer'
      editLink.href = '#'
      editLink.classList.add('edit__link')

      // Ajoutez le conteneur à la figure
      figure.appendChild(container)

      // Ajoutez le lien "éditer" à la figure
      figure.appendChild(editLink)

      dialogGalleryContent.appendChild(figure)
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

  // Fonction pour mettre à jour la liste déroulante des catégories
  function updateCategoryDropdown(works) {
    const categoryDropdown = document.getElementById('form__category')
    const categories = new Set(works.map((work) => work.category.name))

    // Effacer toutes les options actuelles
    categoryDropdown.innerHTML = ''

    // Ajouter une option "Tous" par défaut
    const allOption = document.createElement('option')
    allOption.value = 'Tous'
    allOption.textContent = 'Tous'
    categoryDropdown.appendChild(allOption)

    // Ajouter chaque catégorie unique comme option
    categories.forEach((category) => {
      const option = document.createElement('option')
      option.value = category
      option.textContent = category
      categoryDropdown.appendChild(option)
    })
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
      displayWorksInDialog(allWorks) // Affichez les travaux dans la fenêtre du dialogue
      updateCategoryDropdown(allWorks) // Mettez à jour la liste déroulante des catégories
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

  // Ajout de l'écouteur d'événement pour le bouton d'ouverture du dialogue
  updateWorksButton.addEventListener('click', function () {
    dialog.style.display = 'flex'
    displayWorksInDialog(allWorks)
  })

  function deletePhoto(photoId) {
    // Récupérer le token d'authentification depuis le stockage local
    const authToken = localStorage.getItem('userToken')

    if (!authToken) {
      console.error("Token d'authentification manquant")
      alert('Vous devez être connecté pour effectuer cette action.')
      return
    }

    const headers = new Headers({
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    })

    fetch(`http://localhost:5678/api/works/${photoId}`, {
      method: 'DELETE',
      headers: headers,
    })
      .then((response) => {
        if (response.ok) {
          // Si la suppression est réussie, actualiser la galerie ou effectuer d'autres actions nécessaires
          console.log(`Photo avec l'ID ${photoId} supprimée avec succès.`)
        } else if (response.status === 401) {
          console.error('Non autorisé à supprimer la photo')
          alert("Vous n'êtes pas autorisé à effectuer cette action.")
        } else {
          return response.json().then((data) => {
            throw new Error(data.message)
          })
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression de la photo:', error)
        alert('Erreur lors de la suppression de la photo : ' + error.message)
      })
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

  // écouteur d'événements pour masquer le dialogue lorsque l'utilisateur clique en dehors
  window.addEventListener('click', function (e) {
    if (e.target === dialog) {
      hideDialog()
    }
  })

  function hideDialog() {
    dialog.style.display = 'none' // Masquer le dialogue
    dialogGallery.style.display = 'block' // Afficher la première fenêtre
    dialogEdit.style.display = 'none' // Masquer la seconde fenêtre
  }

  closeButtonFirstWindow.addEventListener('click', hideDialog)
  closeButtonSecondWindow.addEventListener('click', hideDialog)
  arrowReturn.addEventListener('click', function (e) {
    e.preventDefault()
    hideDialog()
  })

  window.addEventListener('click', function (e) {
    if (e.target === dialog) {
      hideDialog()
    }
  })
})
