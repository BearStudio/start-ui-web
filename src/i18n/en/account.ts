export const account = {
  title: 'Account',
  accountActivation: {
    accountActivationPending: 'Account Activation...',
    accountActivationSuccess: 'Account Activation Success',
    accountActivationError: 'Account Activation Failed',
  },
  register: {
    title: 'Register',
    form: {
      login: {
        label: 'Username',
        userexists: 'Login already used',
        required: 'Username is required',
        isMinLength: 'Username too short (min. {{count}} characters)',
        isMaxLength: 'Username too long (max. {{count}} characters)',
        isPattern: "Username is invalid, don't use special characters",
      },
      email: {
        label: 'Email',
        emailexists: 'Email already used',
        required: 'Email is required',
        isMinLength: 'Email too short (min. {{count}} characters)',
        isMaxLength: 'Email too long (max. {{max}} characters)',
        isEmail: 'Email is invalid',
      },
      password: {
        label: 'Password',
        required: 'Password is required',
        isMinLength: 'Password too short (min. {{count}} characters)',
        isMaxLength: 'Password too long (max. {{max}} characters)',
      },
    },
    messages: {
      registrationFailed: 'Registration Failed',
      accountCreatedSuccess: {
        title: 'Account created with success!',
        description:
          'Please check your email <1>{{accountEmail}}</1> inbox to activate your account.',
      },
    },
    actions: {
      goToLogin: 'Go to Login',
      createAccount: 'Create Account',
      alreadyHaveAnAccount: 'Already have an account?',
      login: 'Login',
    },
  },
};
