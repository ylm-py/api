// Configuration Firebase de TON projet.
// Console Firebase > Paramètres du projet > Vos applications > application Web (</>) > Config.
// Remplace les valeurs ci-dessous, sinon l'authentification et Firestore ne fonctionneront pas.
// La clé apiKey n'est pas un secret : elle identifie le projet. La sécurité vient des Security Rules.
export const environment = {
  firebase: {
    apiKey: 'REMPLACER_PAR_TA_API_KEY',
    authDomain: 'REMPLACER.firebaseapp.com',
    projectId: 'REMPLACER',
    storageBucket: 'REMPLACER.firebasestorage.app',
    messagingSenderId: 'REMPLACER',
    appId: 'REMPLACER'
  }
};
