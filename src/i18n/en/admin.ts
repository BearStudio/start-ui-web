export const admin = {
  user: 'User',
  userManagement: 'User Management',
  loginEmail: 'Login / Email',
  id: 'ID',
  authorities: 'Authorities',
  createdBy: 'Created By',
  modifiedBy: 'Modified By',
  status: 'Status',
  activated: 'Activated',
  notActivated: 'Not Activated',
  messages: {
    accountActivated: {
      title: 'Account Activated',
      description: 'Account "{{login}}" activated with success'
    },
    accountDeactivated: {
      title: 'Account Deactivated',
      description: 'Account "{{login}}" deactivated with success'
    },
    accountActivationFailed: {
      title: 'Activation Failed',
      description: 'Fail to activate "{{login}}" account'
    },
    accountDeactivationFailed: {
      title: 'Deactivation Failed',
      description: 'Fail to deactivate "{{login}}" account'
    }
  },
  actions: {
    edit: 'Edit',
    deactivateAccount: 'Deactivate Account',
    activateAccount: 'Activate Account',
    delete: 'Delete',
    createUser: 'Create User',
  }
}
