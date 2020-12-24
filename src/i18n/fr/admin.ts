export const admin = {
  users: {
    user: 'Utilisateur',
    userManagement: 'Gestion des utilisateurs',
    loginEmail: 'Login / Email',
    id: 'ID',
    authorities: 'Droits',
    createdBy: 'Créé Par',
    modifiedBy: 'Modifié Par',
    status: 'Status',
    activated: 'Activé',
    notActivated: 'Désactivé',
    messages: {
      accountActivated: {
        title: 'Compte Activé',
        description: 'Compte "{{login}}" activé avec succès'
      },
      accountDeactivated: {
        title: 'Compte Désactivé',
        description: 'Compte "{{login}}" désactivé avec succès'
      },
      accountActivationFailed: {
        title: 'Echec Activation',
        description: 'Le compte "{{login}}" n\'a pas pu être activé',
      },
      accountDeactivationFailed: {
        title: 'Echec Désactivation',
        description: 'Le compte "{{login}}" n\'a pas pu être désactivé'
      }
    },
    actions: {
      edit: 'Modifier',
      deactivateAccount: 'Désactiver le compte',
      activateAccount: 'Activer le compte',
      delete: 'Supprimer',
      createUser: 'Créer un utilisateur'
    }
  }
}
