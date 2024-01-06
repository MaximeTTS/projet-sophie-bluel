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

document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.querySelector('.gallery');
  
    // Récupération des travaux depuis l'API
    let allWorks = [];
    fetch('http://localhost:5678/api/works')
      .then(response => response.json())
      .then(works => {
        allWorks = works;
        displayWorks(allWorks);
      })
      .catch(error => console.error('Error fetching works:', error));
  
    // Fonction pour afficher les travaux dans la galerie
    function displayWorks(works) {
      galleryContainer.innerHTML = ''; // Videz la galerie avant d'ajouter les nouveaux travaux
      works.forEach(work => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.src = work.imageUrl;
        image.alt = work.title;
        figure.appendChild(image);
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;
        figure.appendChild(figcaption);
        galleryContainer.appendChild(figure);
      });
    }
  
    // Ajout d'écouteurs d'événements sur les boutons de filtre
    document.querySelectorAll('.btn__filters').forEach(button => {
      button.addEventListener('click', () => {
        filterWorks(button.textContent);
      });
    });
  
    function normalizeString(str) {
      return str
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/\s+/g, ' ')
        .replace('&', 'and')
        .toLowerCase()
        .trim();
    }  
    
    function filterWorks(category) {
      // Si le bouton "Tous" est cliqué, affichez tous les travaux.
      if (category === 'Tous') {
        displayWorks(allWorks);
      } else {
        // Sinon, filtrez les travaux par catégorie.
        // Nous utilisons normalizeString pour la comparaison afin d'éviter les problèmes de casse et d'espacement.
        const normalizedCategory = normalizeString(category);
        const filteredWorks = allWorks.filter(work => {
          const normalizedWorkCategory = normalizeString(work.category.name);
          return normalizedWorkCategory === normalizedCategory;
        });
    
        console.log(`Travaux filtrés pour la catégorie: '${category}'`, filteredWorks);
        displayWorks(filteredWorks);
      }
    }
  });

  document.querySelectorAll('.btn__filters').forEach(button => {
    button.addEventListener('click', function() {
      // Enlevez la classe 'btn__filters--selected' de tous les boutons
      document.querySelectorAll('.btn__filters').forEach(btn => {
        btn.classList.remove('btn__filters--selected');
      });
      
      // Ajoutez la classe 'btn__filters--selected' au bouton cliqué
      this.classList.add('btn__filters--selected');
      
      // Appelez filterWorks avec le texte du bouton
      filterWorks(this.textContent);
    });
  });