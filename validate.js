/*

Possible features:
1. Persistent input
2. Password Strength meter rules

*/
(function(window, document, $){
    
    if($ === undefined){
        console.log('Please include jQuery.');
        return;
    }
    
    var regex = {
        string: /^[a-zA-Z.' ''^-]*$/,
        number: /^[0-9]+$/,
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        url: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        date: /\d{4}-\d{1,2}-\d{1,2}/,
        rule: /^(.+?)\[(.+)\]$/
    }
    
    // 'field' is the javascript object modal for '_field'

    
    var validate = function(formId, fields) {
        var self = this;
        self.fields = {};
        self.form =  $('#' + formId);
        self.errors = [];
        
        self.form.attr('novalidate', 'novalidate');
        
        fields.forEach(function(_field, index){
            if (!_field.name || !_field.rules) {
                console.warn( _field + ' has missing name or rules.');
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
        var fieldName = _field.name;
        var self = this;
        var el = self.form.find('[name=' + fieldName + ']');
        self.fields[fieldName] = {
            name: fieldName,
            rules: _field.rules,
            element: el,
            type: el.attr('type'),
            value: null,
            checked: null,
            messages: _field.messages || {},
            errors: [],
            errorElement: null
        }
        
        el.on('change', function(){
            self._updateField(self.fields[fieldName]);
            self._validateField(self.fields[fieldName]);
            self._updateError(self.fields[fieldName]);
        })
    }
    
    v._updateField = function(field) {
        if ((field.type === 'checkbox') || (field.type === 'radio')) {
            field.checked = field.element[0].checked;
        }
        field.value = field.element.val();
    }
    
    v._validateField = function(field) {
        var self = this;
        var rules = field.rules.split('|');
        field.errors = [];
        
        rules.forEach(function(rule, index){
            var parts = regex.rule.exec(rule);
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
                    errorMessage = errorMessage.replace('{}', field.name);
                    if (param) {
                        errorMessage = errorMessage.replace('{}', param);
                    }
                    field.errors.push(errorMessage);
                }
            }
        });
    }
    
    v._updateError = function(field) {
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
    
    v._validateForm = function(event) {
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
        valid_email: function(field) {
            return regex.email.test(field.value);
        },
        match: function(field, matchName) {
            var el = this.form[0][matchName];
            if (el) {
                return field.value === el.value;
            }
            return false;
        }
    }
    
    v._messages = {
        default: 'The {} field is not valid.',
        required: 'The {} field is required.',
        match: 'The {} field does not match the {} field.',
        valid_email: 'The {} field must contain a valid email address.',
    }
    
    v.addRule = function(rule) {
        $.extend(this._rules, rule);
    }
    
    v.setMessage = function(ruleName, message) {
        this._messages[ruleName] = message;
    }
    
    function _passwordStrengthMeter(password) {
        var desc;
        var score = 0;
        if (password.length > 4) {
            score++;
        }
        if ((password.match(/[a-z]/)) && (password.match(/\d+/))) {
            score++;
        }
        if (password.length > 7) {
            score++;
        }
        if (password.match(/[~,`,!,@,#,$,%,^,&,*,(, ,),_,-,+,{,},|,;,',.,//,?,>,<,",:]/)) {
            desc = 'Invalid Character';
            passwordStrength = 'Pinvalid';
        } else {
            if (password.length < 5 && password.length !== 0 ) { 
                desc = 'Too Short'; 
                passwordStrength = 'Pshort'; 
            }
            else {
                switch (score) {
                    case 1: {
                        desc = 'OK';
                        passwordStrength = 'Plevel1';
                    }
                    case 2: {
                        desc = 'OK';
                        passwordStrength = 'Plevel2';
                    }
                    case 3: {
                        desc = 'OK';
                        passwordStrength = 'Plevel3';
                    }
                    default: {
                        desc = 'OK';
                        passwordStrength = 'Plevel1';
                    }
                }
            }
        }
        if (password.length === 0 ) { 
            desc = "Blank"; 
            passwordStrength='' 
        }
    }
    
    window.validate = validate;
    
})(window, document, jQuery)
