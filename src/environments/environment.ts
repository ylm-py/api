// Configuration Firebase de TON projet.
// Console Firebase > Paramètres du projet > Vos applications > application Web (</>) > Config.
// Remplace les valeurs ci-dessous, sinon l'authentification et Firestore ne fonctionneront pas.
// La clé apiKey n'est pas un secret : elle identifie le projet. La sécurité vient des Security Rules.
export const environment = {
  firebase: {
    apiKey: 'AIzaSyApTRJTKNtRvIOXfcDPaItmUC6aneY3blg',
    authDomain: 'pantry-app-s10.firebaseapp.com',
    projectId: 'pantry-app-s10',
    storageBucket: 'pantry-app-s10.firebasestorage.app',
    messagingSenderId: '1019278244777',
    appId: '1:1019278244777:web:2927f2826609fe22ab62b8'
  }
};
