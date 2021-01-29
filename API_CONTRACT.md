# API CONTRACT

## Module Account

### Get current account

GET - /api/account
```
Response :
{
    id,
    login,
    firstName,
    lastName,
    email,
    activated,
    langKey,
    createdBy,
    createDate,
    lastModifiedBy,
    lastModifiedDate,
    authorities
}
```

### Create an account

POST - /api/register
```
Query :
{
    login,
    email,
    password,
    langKey, (default 'en')
    authorities
}
```
_login, firstName, lastName, email, password, langKey are strings, authorities is an array_

```
Error response :
{
    title,
    errorKey (string like 'emailexists' or 'userexists')
}
```

### Activate an account

GET - /api/activate?key=$key
```
Query : key
```
_key is a string_

### Update an account

POST - /api/account
```
Query :
{
    account
}
```

```
Error response :
{
    title
}
```

### Init reset password

POST - /api/account/reset-password/init
```
Query :
{
    email
}
Set "headers: { 'Content-Type': 'text/plain' }"
```

```
Error response :
{
    title
}
```

### Finish reset password

POST - /api/account/reset-password/finish
```
Query :
{
    key,
    newPassword
}
```

```
Error response :
{
    title
}
```

### Change password

POST - /api/account/change-password
```
Query :
{
    currentPassword,
    newPassword
}
```

```
Error response :
{
    title
}
```

## Module Admin/Users

### Create a user

POST - /api/users
```
Query :
{
    login,
    firstName,
    lastName,
    email,
    password,
    langKey, (default 'en')
    authorities
}
```
_login, firstName, lastName, email, password, langKey are strings, authorities is an array_

```
Error response :
{
    title,
    errorKey (string like 'emailexists' or 'userexists')
}
```

### Get All Users

GET - /api/users
```
Query :
{
    params : {
        page,
        size
    }
}
```
_page and size are integers_

```
Response :
[
    {
        id,
        login,
        ...
    },
    {
        id,
        login,
        ...
    }
]
```

### Get a User

GET - /api/users/$userLogin
```
Query : userLogin
```
_userLogin is a string_

```
Response :
{
    id,
    login,
    firstName,
    lastName,
    email,
    activated,
    langKey,
    createdBy,
    createDate,
    lastModifiedBy,
    lastModifiedDate,
    authorities
}
```
_activated is a boolean, authorities is an array of user's authority_

---

### Delete a user

DELETE - /api/users/$userLogin
```
Query :
$userLogin
```
_userLogin is a string_

```
Response :
{
    id,
    login,
    firstName,
    lastName,
    email,
    activated,
    langKey,
    createdBy,
    createDate,
    lastModifiedBy,
    lastModifiedDate,
    authorities
}
```
_activated is a boolean, authorities is an array of user's authority_

---

### Update a user

PUT - /api/users
```
Query :
{
    id,
    login,
    firstName,
    lastName,
    email,
    activated,
    langKey,
    createdBy,
    createDate,
    lastModifiedBy,
    lastModifiedDate,
    authorities
}
```
_activated is a boolean, authorities is an array of user's authority_

## Authentication module

### Authentication

POST - /api/authenticate
```
Query :
{
    username,
    password
}
```
_username, password are strings_

```
Response on success :
{
    id_token (string)
}
```
_id_token is a string_

```
Error response :
{
    status, (number)
    detail (string)
}
```
_status is a number, detail is a string_
