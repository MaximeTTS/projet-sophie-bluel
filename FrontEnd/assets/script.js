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

  // Fonction pour afficher les travaux dans la galerie
  function displayWorks(works) {
    galleryContainer.innerHTML = ''
    works.forEach((work) => {
      const figure = createFigure(work)
      galleryContainer.appendChild(figure)
    })
  }

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

  // Afficher les travaux/images dans votre modal
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
        deletePhoto(work.id).then(() => {
          // Supprimez le projet de la modale
          figure.remove()
        })
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

  // Fonction pour supprimer une photo
  function updateUIAfterDelete(photoId) {
    const index = allWorks.findIndex((work) => work.id === photoId)
    if (index !== -1) allWorks.splice(index, 1)
    displayWorks(allWorks)

    const figureToRemove = document.querySelector(`#dialog__gallery .dialog__content figure[data-id="${photoId}"]`)
    figureToRemove?.remove()
  }

  function deletePhoto(photoId) {
    const authToken = localStorage.getItem('userToken')
    if (!authToken) {
      console.error("Token d'authentification manquant")
      alert('Vous devez être connecté pour effectuer cette action.')
      return
    }

    fetch(`http://localhost:5678/api/works/${photoId}`, {
      method: 'DELETE',
      headers: new Headers({
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log(`Photo avec l'ID ${photoId} supprimée avec succès.`)
          updateUIAfterDelete(photoId)
        } else if (response.status === 401) {
          console.error('Non autorisé à supprimer la photo')
          alert("Vous n'êtes pas autorisé à effectuer cette action.")
        } else {
          return response.json().then((data) => Promise.reject(new Error(data.message)))
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression de la photo:', error)
        alert('Erreur lors de la suppression de la photo : ' + error.message)
      })
  }

  // Fonction pour envoyer le formulaire
  function submitForm(event) {
    event.preventDefault()

    const title = document.getElementById('form__title').value
    const category = parseInt(document.getElementById('form__category').value)
    const imageInput = document.getElementById('form__image')
    const authToken = localStorage.getItem('userToken')

    if (!authToken) {
      alert('Vous devez être connecté pour effectuer cette action.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)

    if (imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0])
    } else {
      alert('Veuillez sélectionner un fichier image.')
      return
    }

    fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: new Headers({ Authorization: `Bearer ${authToken}` }),
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi de l'image : " + response.statusText)
        }
        return response.json()
      })
      .then((result) => {
        console.log(result)
        event.target.reset() // Reset le formulaire
        // Réinitialiser la source de l'image de prévisualisation
        document.getElementById('previewImage').src = ''

        // Ajoutez la nouvelle œuvre à la liste allWorks
        allWorks.push(result)

        // Rafraîchir l'affichage de la galerie avec les nouvelles données
        displayWorks(allWorks)
        displayWorksInDialog(allWorks)
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi de l'image :", error)
        alert("Erreur lors de l'envoi de l'image : " + error.message)
      })
  }

  // Écouteur d'événements pour la prévisualisation de l'image
  document.getElementById('form__image').addEventListener('change', function () {
    const file = this.files[0]
    if (file && file.type.match('image.*')) {
      if (file.size <= 4 * 1024 * 1024) {
        // Vérifier que la taille du fichier est inférieure ou égale à 4 Mo
        const reader = new FileReader()
        reader.onload = function (e) {
          const previewImage = document.getElementById('previewImage')
          previewImage.src = e.target.result

          // Réinitialiser le padding à 0
          const dialogContentNewPhoto = document.querySelector('.dialog__content__new__photo')
          dialogContentNewPhoto.style.padding = '0px'

          document.querySelector('.content__add__form').style.display = 'none'
          previewImage.style.display = 'block'
        }
        reader.readAsDataURL(file)
      } else {
        alert("La taille de l'image ne doit pas dépasser 4 Mo.")
        // Réinitialiser l'élément d'entrée de fichier si la taille est trop grande
        this.value = ''
      }
    }

    // Écouteur d'événements pour la soumission du formulaire
    document.getElementById('dialog__edit__work__form').addEventListener('submit', function (e) {
      e.preventDefault() // Empêche la soumission du formulaire
      const contentAdd = document.querySelector('.content__add__form')
      contentAdd.style.display = ''

      const previewImage = document.getElementById('previewImage')
      previewImage.style.display = 'none' // Cacher l'élément #previewImage

      const dialogContentNewPhoto = document.querySelector('.dialog__content__new__photo')
      dialogContentNewPhoto.style.padding = '' // Réinitialiser le padding
    })

    // Écouteur d'événements pour soumettre le formulaire
    document.getElementById('dialog__edit__work__form').addEventListener('submit', submitForm)
    document.getElementById('form__image').addEventListener('change', updateSubmitButton)
    document.getElementById('form__title').addEventListener('input', updateSubmitButton)

    function updateSubmitButton() {
      const file = document.getElementById('form__image').files[0]
      const title = document.getElementById('form__title').value
      const submitButton = document.getElementById('submit__new__work')

      // Vérifier si le fichier est une image et si le titre est rempli
      if (file && title.trim() !== '') {
        submitButton.style.backgroundColor = '#1d6154'
      } else {
        submitButton.style.backgroundColor = '' // Revenir au style par défaut
      }
    }
  })

  function updateCategoryDropdown() {
    const categoryDropdown = document.getElementById('form__category')

    // Appel à l'API pour obtenir les catégories
    fetch('http://localhost:5678/api/categories', {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((categories) => {
        // Effacer toutes les options actuelles
        categoryDropdown.innerHTML = ''

        // Ajouter chaque catégorie reçue comme option
        categories.forEach((category) => {
          const option = document.createElement('option')
          option.value = category.id // Utiliser l'identifiant de la catégorie comme valeur
          option.textContent = category.name
          categoryDropdown.appendChild(option)
        })
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des catégories:', error)
      })
  }
  // Appel initial de la fonction
  updateCategoryDropdown()

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
    document.getElementById('dialog__edit__work__form').reset() // Réinitialiser le formulaire
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
    document.getElementById('dialog__edit__work__form').reset() // Réinitialiser le formulaire
  })

  // écouteur d'événements pour masquer le dialogue lorsque l'utilisateur clique en dehors
  window.addEventListener('click', function (e) {
    if (e.target === dialog) {
      hideDialog()
    }
  })
})
