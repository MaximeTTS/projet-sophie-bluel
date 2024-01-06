document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery');
  
    fetch('http://localhost:5678/api/works')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(works => {
        galleryContainer.innerHTML = ''; // Videz la galerie avant d'ajouter les nouveaux travaux
  
        works.forEach(work => {
          // Créez un élément figure pour chaque travail
          const figure = document.createElement('figure');
  
          // Ajoutez une image si disponible
          const image   = document.createElement('img');
          image.src     = work.imageUrl;
          image.alt     = work.title;
          figure.appendChild(image);
  
          // Ajoutez une légende avec le titre du travail
          const figcaption          = document.createElement('figcaption');
          figcaption.textContent    = work.title;
          figure.appendChild(figcaption);
  
          // Insérez la figure dans le conteneur de la galerie
          galleryContainer.appendChild(figure);
        });
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        galleryContainer.textContent = 'Failed to load works.';
      });
  });
  