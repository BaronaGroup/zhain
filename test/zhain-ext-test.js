describe('zhain-ext-test', notInNode(function() {
  var z = require('../zhain')
  var assert = require('chai').assert
  var $sut

  z.ext.register()

  beforeEach(function() {
    if ($sut) $sut.remove()
    $sut = $('<div>').attr('id', 'sut').appendTo($('body'))
  })

  it('waitForAjax', function(done) {
    var projectName;
    $.get('./package.json', function(json) { projectName = json.name }, 'json')
    z().waitForAjax().run(function() {
      assert.equal(projectName, 'zhain')
      done()
    })
  })

  it('waitForThrottledAjax', function(done) {
    var projectName;
    setTimeout(function() { $.get('./package.json', function(json) { projectName = json.name }, 'json') }, 10)
    z().waitForThrottledAjax().run(function() {
      assert.equal(projectName, 'zhain')
      done()
    })
  })

  it('waitUntilExists', function(done) {
    setTimeout(function() { $sut.html(box()) }, 10)
    z().waitUntilExists($('#sut #box')).run(function() {
      assert.equal($('#sut #box').length, 1)
      done()
    })
  })

  it('waitUntilVisible', function(done) {
    $(box()).hide().appendTo($sut)
    setTimeout(function() { $('#sut #box').show() }, 10)
    z().waitUntilVisible($('#sut #box')).run(function() {
      assert.isTrue($('#sut #box').is(':visible'))
      done()
    })
  })

  it('waitForTransitionEnd', function(done) {
    $sut.html(box())
    $('#box').css(csstransitions())
    setTimeout(function() { $('#box').css('right', '300px') }, 0)
    z().waitForTransitionEnd($('#box')).run(function() {
      assert.equal($('#box').css('right'), '300px')
      done()
    })
  })

  it('waitForAnimations', function(done) {
    $sut.html(box())
    $('#box').animate({ right: 300 }, 100)
    z().waitForAnimations().run(function() {
      assert.equal($('#box').css('right'), '300px')
      done()
    })
  })

  it('enterVal', function(done) {
    $sut.html(input())
    z().enterVal($('#sut input'), 'pow').run(function() {
      assert.equal($('#sut input').val(), 'pow')
      done()
    })
  })

  it('asserts', function(done) {
    $(input()).val('pow').appendTo($sut)
    $('<p>pow</p>').appendTo($sut)
    $('<section/>').appendTo($sut)
    $('<input id="checkbox" type="checkbox"/>').appendTo($sut)
    z().assertVal($('#sut input'), 'pow')
      .do(function() { $('#sut input').attr('disabled', 'disabled') }).assertDisabled($('#sut input'))
      .do(function() { $('#sut input').removeAttr('disabled') }).assertEnabled($('#sut input'))
      .assertText($('#sut p'), 'pow')
      .do(function() { $('#sut p').hide() }).assertHidden($('#sut p')).assertNotVisible($('#sut p'))
      .do(function() { $('#sut p').show() }).assertVisible($('#sut p'))
      .assertDoesNotExist($('#sut span'))
      .assertCount($('#sut p, #sut input'), 3)
      .do(function() { $('#sut section').text('pow') }).assertNotEmpty($('#sut section'))
      .do(function() { $('#sut section').empty() }).assertEmpty($('#sut section'))
      .do(function() { $('#sut p').addClass('pow') }).assertHasClass($('#sut p'), 'pow')
      .do(function() { $('#sut p').removeClass('pow') }).assertNoClass($('#sut p'), 'pow')
      .click($('#sut #checkbox')).assertChecked($('#sut #checkbox'))
      .click($('#sut #checkbox')).assertNotChecked($('#sut #checkbox'))
      .run(done)
  })

  function box() { return '<div id="box" style="width:10px; height:10px; background-color:red; position: absolute; top: 60px; right: 10px;"></div>' }
  function input() { return '<input type="text">' }
  function csstransitions() { return { '-webkit-transition': 'all .1s ease', '-moz-transition': 'all .1s ease;', '-o-transition': 'all .1s ease', '-ms-transition': 'all .1s ease', transition: 'all .1s ease' } }
}))

function notInNode(fn) {
  return (typeof module !== 'undefined') ? function() { console.log('>> Not running: zhain-ext-test. Only makes sense in browsers') } : fn
}