(function(window, document, $){
  if ($ === undefined){
    console.log('Please include jQuery.');
    return;
  }
  
  var regex = {
    name: /^[a-zA-Z.' ''^-]*$/,
    username: /^[a-zA-Z0-9@.-_]{5,}$/,
    number: /^[0-9]+$/,
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    url: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
    date: /\d{4}-\d{1,2}-\d{1,2}/,
    ruleArg: /^(.+?)\[(.+)\]$/,
    password: /^[a-zA-Z0-9]{5,}$/	
  }
  var cache = {};
  
  // 'field' is the javascript object modal for '_field'
  
  /**
   * @param {String} formId   DOM entry point
   * @param {Array} [fields]  Array of field with id, rules, and messages from JSON
   */
  var validate = function (formId, fields) {
    try {
      if (arguments.length !== 2) {
        throw('validate takes two paramenter, form ID and fields object');
      }
      if (Object.prototype.toString.call( fields ) !== '[object Array]') {
        throw('fields must be an array');
      }
    } catch(e) {
      console.log(e);
      return;
    }


    var self = this;
    self.fields = {};
    self.form =  $('#' + formId);
    self.errors = [];
        
    self.form.attr('novalidate', 'novalidate');
        
    fields.forEach(function (_field, index){
      if (!_field.id || !_field.rules) {
        console.warn( _field + ' has missing id or rules.');
        return;
      }
      self._addField(_field);
    })
    
    var _onsubmit = self.form[0].onsubmit;
    self.form[0].onsubmit = (function(that) {
      return function(event) {
        try {
          return that._validateForm(event) && (_onsubmit === null || _onsumbit === undefined || _onsubmit());
        } catch(e) { 
          event.preventDefault();
          console.warn(e);
        }
      };
    })(self);
  }
    
  var v = validate.prototype;

  v._addField = function(_field) {
    var fieldName = _field.id;
    var self = this;
    var el = self.form.find('#' + _field.id);
      
    cache[fieldName] = {
      id: _field.id,
      rules: _field.rules,
      element: null,
      type: null,
      value: null,
      checked: null,
      hint: _field.hint,
      hintExample: _field.hintExample,
      messages: _field.messages || {},
      errors: [],
      errorElement: null
    };    
    
    // If this element is not on DOM, store field info on cache
    if (el.length === 0) {
        return;
    }

    self.fields[fieldName] = {
      id: _field.id,
      rules: _field.rules,
      element: el,
      type: el.attr('type'),
      value: null,
      checked: null,
      hint: _field.hint,
      hintExample: _field.hintExample,
      messages: _field.messages || {},
      errors: [],
      errorElement: null
    }

    el.on('change', function(){
      self._updateField(self.fields[fieldName]);
      self._validateField(self.fields[fieldName]);
      self._updateError(self.fields[fieldName]);
    })

    self._addHint(self.fields[fieldName]);
  }
    
	v._addHint = function(field) {
		if (field.hint !== undefined) {
			var hint = $('<div class="hint">' + field.hint + '</div>');
			field.element.after(hint);
			hint.hide();
			field.element.on('focus', function(){
				hint.show();
			}).on('blur', function(){
				hint.hide();
			})
		}
	}
		
  v._updateField = function (field) {
    if ((field.type === 'checkbox') || (field.type === 'radio')) {
      field.checked = field.element[0].checked;
    }
    field.value = field.element.val();
  }
    
  v._validateField = function (field) {
    var self = this;
    var rules = field.rules.split('|');
    field.errors = [];
        
    for (var index = 0; index < rules.length; index++){
      var rule = rules[index];
      var parts = regex.ruleArg.exec(rule);
      var validator = self._rules[rule];
      var param = null;
      var failed = false;
      if (parts) {
        validator = self._rules[parts[1]];
        rule = parts[1];
        param = parts[2];
      }
            
      if(typeof validator !== 'function'){
        console.warn('rule ' + rule +' is not defined');
        return;
      } else {
        failed = !validator.apply(self, [field, param]);
      }
      
      if (failed) {
        var errorMessage = field.messages[rule] || self._messages[rule] || self._messages['default'];
        if (errorMessage) {
          errorMessage = errorMessage.replace('{}', field.id);
          if (param) {
            errorMessage = errorMessage.replace('{}', param);
          }
            field.errors.push(errorMessage);
          }
          break;
      }
    }
  }
    
  v._updateError = function (field) {
    if(!field.errorElement) {
      field.element.after('<div class="error-message"></div>');
      field.errorElement = field.element.siblings('.error-message');
      field.errorElement.parent().css('position', 'relative');
    }
    if (field.errors.length === 0) {
      field.errorElement.hide();
    } else {
      var message = field.errors.join('\n');
      field.errorElement.html(message).show();
    }
  }
    
  v._validateForm = function (event) {
    this.errors = [];

    for (var key in this.fields) {
      if (this.fields.hasOwnProperty(key)) {
        var field = this.fields[key] || {};
        this._validateField(field);
        this._updateError(field);
        Array.prototype.push.apply(this.errors, field.errors);
      }
    }

    if (typeof this.callback === 'function') {
      this.callback(this.errors, event);
    }
    
    if (this.errors.length > 0) {
      event.preventDefault();
      return false;
    }

    return true;
  };

  v._rules = {
    required: function(field) {
      var val = field.value;
      if ((field.type === 'checkbox') || (field.type === 'radio')) {
          return field.checked === true;
      }
      return (val !== null && val !== '');
    },
    email: function(field) {
      return regex.email.test(field.value);
    },
    match: function(field, matchName) {
      var el = this.form[0][matchName];
      if (el) {
          return field.value === el.value;
      }
      return false;
    },
    password: function(field) {
      return regex.password.test(field.value);
    },
    name: function(field) {
      return regex.name.test(field.value);
    },
    username: function(field) {
      return regex.username.test(field.value); 
    },
    maxLength: function(field, max) {
      return field.value.length <= parseInt(max);
    },
    minLength: function(field, min) {
      return field.value.length >= parseInt(min);
    },
    minAge: function(field) {
      return (new Date().getFullYear() - parseInt(field.value)) > 20;
    }
  }
  
  v._messages = {
    default: 'The {} field is not valid.',
    required: '{} is required.',
    name: "Invalid {}. Valid Characters include(a-z,.,' ',',^,-).",
    match: 'The {} field does not match the {} field.',
    valid_email: 'The {} field must contain a valid email address.',
    valid_name: 'The {} field is not a valid name.',
    min_length: '{} must contain at least {} characters.',
    max_length: '{} cannot be greater than {} characters.'
  }
  
  v.setRule = function(rule) {
    $.extend(this._rules, rule);
  }
  
  v.setMessage = function(ruleName, message) {
    this._messages[ruleName] = message;
  }
  
  v.update = function() {
    var self = this;
    for (var field in cache) {
      if (cache.hasOwnProperty(field)) {
        var el = self.form.find('#' + cache[field].id);
        if (el.length !== 0 && self.fields[field] !== undefined) {
            continue;
        } else if (el.length !== 0 && self.fields[field] === undefined) {
            cache[field].element = el;
            cache[field].type = el.attr('type');
            self.fields[field] = cache[field];
            
            var newField = self.fields[field]
            el.on('change', function(){
                self._updateField(newField);
                self._validateField(newField);
                self._updateError(newField);
            })

            self._addHint(self.fields[field]);
        } else if (el.length === 0 && self.fields[field] !== undefined) {
            delete self.fields[field];
            cache[field].errorElement = null;
        }
      }
    }
  }
  
  window.validate = validate;
    
})(window, document, jQuery)