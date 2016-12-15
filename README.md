# validate

A minimal validate library.
Easily extended.
Custom rules and error messages.
No styling.

# Dependency

jQuery 

# Use

```javascript
var fields = [
      {
          name: 'email',
          rules: 'required|valid_email',
          messages:{
              required: 'You must enter a email!!!'
          }
      },
      {
          name: 'password',
          rules: 'required'
      },
      {
          name: 'password-match',
          rules: 'required|match[password]'
      },
      {
          name: 'term',
          rules: 'required'
      },
      {
          name: 'name',
          rules: 'valid_name|required|max_length[50]|min_length[5]'
      }
  ];

var form = new validate('my', fields);
```

# To-do

1. Persistent input
2. Password Strength meter rules

