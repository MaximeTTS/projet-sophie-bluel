document.getElementById('dialog__edit__work__form').addEventListener('submit', async (event) => {
  event.preventDefault()

  const title = document.getElementById('form__title').value
  const category = parseInt(document.getElementById('form__category').value)
  const imageInput = document.getElementById('form__image')
  const authToken = localStorage.getItem('userToken')
  const dialog = document.getElementById('dialog')

  // Créez FormData ici
  const formData = new FormData()
  formData.append('title', title)
  formData.append('category', category)

  // Vérifiez si un fichier image est sélectionné
  if (imageInput.files.length > 0) {
    formData.append('image', imageInput.files[0])
  } else {
    alert('Please select an image file.')
    return
  }

  try {
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${authToken}`,
      }),
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Error updating the work: ' + response.statusText)
    }

    const result = await response.json()
    console.log(result)
    alert('Work updated successfully')

    // Mettez à jour l'interface utilisateur...
    allWorks.push(result)
    displayWorks(allWorks)
    updateCategoryDropdown(allWorks)
  } catch (error) {
    console.error('Error updating the work:', error)
    alert('Error updating the work: ' + error.message)
  }

  dialog.style.display = 'none'
  document.getElementById('dialog__edit__work__form').reset()
})
