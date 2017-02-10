describe('Validate', function(){
  var form, rule, v, name, field;

  beforeAll(function(){
    name = 'testInput'
    form = $('<form id="testForm"><input id="testInput"><div id="some_element"></div></form>');
    $('body').append(form);
    rule = [{
      id: "testInput",
      rules: "required|name|maxLength[35]",
      messages: {
        required: "First Name is required",
        name: "Invalid First Name. Valid Characters(a-z,.,' ',',^,-).",
        maxLength: "First Name cannot be greater than 35 characters."
      }
    }]
  })

  beforeEach(function(){
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
  })

  afterEach(function(){
    v = null;
    $('.error-message').remove();
    $('#testForm').find('*').off();
  })

  it('form is in dom', function(){
    expect($('#testForm')[0]).toBeInDOM();
  })

  it('creates a new validate instance', function(){
    expect(new validate('testForm', rule)).toBeDefined();
  })

  it('logs error with incorrect parameter when initializing', function(){
    spyOn(console, 'log');
    expect(new validate('testForm', {x:'y'})).toBeDefined();
    expect(new validate('testForm')).toBeDefined();
    expect(console.log).toHaveBeenCalled();
  })

  it('set instance with proper properties', function(){
    expect(v.form.attr('novalidate')).toBe('novalidate');
    expect(v.form.find('#testInput').length).toBeGreaterThan(0);
    expect(v.errors.length).toEqual(0);
  })

  it('addes a correct field with properties', function(){
    expect(v.fields[name]).toBeDefined();
    expect(v.fields[name].rules).toEqual('required|name|maxLength[35]');
    expect(v.fields[name].messages['required']).toEqual('First Name is required');
    expect(v.fields[name].errors.length).toEqual(0);
  })

  it('has proper event handling', function(){
    var updateField = spyOn(v, '_updateField');
    var updateError = spyOn(v, '_updateError');
    var validateField = spyOn(v, '_validateField');
    $('#testInput').val('somevalue').change();
    expect(updateField).toHaveBeenCalled();
    expect(updateError).toHaveBeenCalled();
    expect(validateField).toHaveBeenCalled();
  })

  it('update field is working properly', function(){
    $('#testInput').val('somevalue').change();
    expect(v.fields[name].value).toEqual('somevalue');
  })

  it('only uses the correct validators to validate fields', function(){
    var required = spyOn(v._rules, 'required').and.returnValue(true);
    var name = spyOn(v._rules, 'name').and.returnValue(true);
    var maxLength = spyOn(v._rules, 'maxLength').and.returnValue(true);
    var minLength = spyOn(v._rules, 'minLength');
    $('#testInput').val('somevalue');
    v._validateField(v.fields['testInput']);
    expect(required).toHaveBeenCalled();
    expect(name).toHaveBeenCalled();
    expect(maxLength).toHaveBeenCalled();
    expect(minLength).not.toHaveBeenCalled();
  })

  it('updates correct errors', function(){
    expect(field.errors.length).toEqual(0);
    v._validateField(v.fields['testInput']);
    expect(field.errors.length).toEqual(1);
    expect(field.errors[0]).toEqual('First Name is required');
  })

  it('updates correct errors with multiply rules', function(){
    expect(field.errors.length).toEqual(0);
    $('#testInput').val('someextremlylongnamewhichcouldhappeninreallifeintheorybutnotallowinourapp').change();
    v._validateField(v.fields['testInput']);
    expect(field.errors.length).toEqual(1);
    expect(field.errors[0]).toEqual('First Name cannot be greater than 35 characters.');
  })

  it('display errors correctly if any', function(){
    field.errors.push('a test error should display');
    v._updateError(field);
    expect(field.errorElement).toBeDefined();
    expect('.error-message').toBeInDOM();
    expect('.error-message').toContainText('a test error should display');
  })

  it('hide errors correctly if change input to be valid', function(){
    field.errors.push('a test error should display');
    v._updateError(field);
    expect(field.errorElement).toBeDefined();
    expect('.error-message').toBeInDOM();
    expect('.error-message').toContainText('a test error should display');
    field.errors = [];
    v._updateError(field);
    expect('.error-message').toBeHidden();
  })

  it('setRule works', function(){
    var sampleRule = {
      unitTest: function() { return true;}
    }
    v.setRule(sampleRule);
    expect(v._rules['unitTest']).toBeDefined();
    expect(typeof v._rules['unitTest']).toEqual('function');
  })

  it('setMessage works', function(){
    v.setMessage('required', 'sample unit test');
    expect(v._messages['required']).toEqual('sample unit test');
  })


})