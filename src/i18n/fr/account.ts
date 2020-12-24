export const account = {
  title: 'Compte',
  accountActivation: {
    accountActivationPending: 'Activation du compte...',
    accountActivationSuccess: 'Compte activé avec succès',
    accountActivationError:
      "Un problème est survenu lors de l'actication du compte",
  },
  register: {
    title: 'Inscription',
    form: {
      login: {
        label: 'Identifiant',
        userexists: 'Identifiant déjà utilisé',
        required: "L'identifiant est requis",
        isMinLength: "L'identifiant est trop petit ({{count}} caractères min.)",
        isMaxLength: "L'identifiant est trop long ({{count}} caractères max.)",
        isPattern:
          "L'identifiant est invalide, n'utilisez pas de caractères spéciaux",
      },
      email: {
        label: 'Email',
        emailexists: 'Email déjà utilisé',
        required: "L'email est requis",
        isMinLength: "L'email est trop petit ({{count}} caractères min.)",
        isMaxLength: "L'email est trop long ({{count}} caractères max.)",
        isEmail: "L'email est invalide",
      },
      password: {
        label: 'Mot de passe',
        required: 'Le mot de passe est requis',
        isMinLength:
          'Le mot de passe est trop petit ({{count}} caractères min.)',
        isMaxLength:
          'Le mot de passe est trop long ({{count}} caractères max.)',
      },
    },
    messages: {
      registrationFailed: "L'inscription a échoué",
      accountCreatedSuccess: {
        title: 'Compte créé avec succès !',
        description:
          'Veuillez valider votre email <1>{{accountEmail}}</1> dans votre messagerie pour activer votre compte.',
      },
    },
    actions: {
      goToLogin: 'Me connecter',
      createAccount: 'Créer le compte',
      alreadyHaveAnAccount: "Déjà un compte ?",
      login: "Connexion",
    },
  },
};
