describe('Project setup', function(){
  it('jQuery is set properly', function(){
    expect($).not.toBeUndefined();
    expect($()).toBeDefined();
  })

  it('Jasmine-jQuery is set properly', function(){
    expect($('<div>some text</div>')).not.toHaveText(/other/);
    expect($('<div><span class="some-class"></span></div>')).toContainElement('.some-class');
    expect($('<div id="some-id"></div>')).toHaveId("some-id");
  })

  it('validate is loaded', function(){
    expect(validate).toBeDefined();
    expect(typeof validate).toBe('function');
  })
})
