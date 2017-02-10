describe('Rules', function(){
  var form, rule, v, name, field;

  beforeAll(function(){
    name = 'testInput'
    form = $('<form id="testForm"><input id="testInput"><div id="some_element"></div></form>');
    $('body').append(form);
  })

  beforeEach(function(){
    
  })

  afterEach(function(){
    v = null;
    $('.error-message').remove();
    $('#testForm').find('*').off();
  })

  it('required works', function(){
    rule = [{ id: "testInput", rules: "required"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('some value').change();
    expect(field.errors.length).toEqual(0);
  })

  it('name works', function(){
    rule = [{ id: "testInput", rules: "name"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('$%$^').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('John').change();
    expect(field.errors.length).toEqual(0);
  })

  it('maxLength works', function(){
    rule = [{ id: "testInput", rules: "maxLength[35]"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('someextremlylongnamewhichcouldhappeninreallifeintheorybutnotallowinourapp').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('normalname').change();
    expect(field.errors.length).toEqual(0);
  })

  it('minLength works', function(){
    rule = [{ id: "testInput", rules: "minLength[10]"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('dsadsa').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('1234567890').change();
    expect(field.errors.length).toEqual(0);
  })

  it('email works', function(){
    rule = [{ id: "testInput", rules: "email"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('dsad.com').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('example@example.com').change();
    expect(field.errors.length).toEqual(0);
  })

  it('minAge works', function(){
    rule = [{ id: "testInput", rules: "minAge"}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('2000').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('1970').change();
    expect(field.errors.length).toEqual(0);
  })

  xit('  works', function(){
    rule = [{ id: "testInput", rules: ""}];
    v = new validate('testForm', rule);
    field = v.fields['testInput'];
    $('#testInput').val('').change();
    expect(field.errors.length).toEqual(1);
    $('#testInput').val('').change();
    expect(field.errors.length).toEqual(0);
  })
  
})