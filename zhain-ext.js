if (typeof define !== 'undefined') {
  define(['zhain', 'chai'], zhainExt)
} else {
  var chai = require('chai')
  var zhain = require('zhain')
  var $ = require('jquery')
  zhainExt(zhain, chai, $)
}

function zhainExt(zhain, chai, $) {
  $ = $ || window.$
  var Zhain = zhain.Zhain
  zhain.ext = {
    assert: chai.assert,
    wait: {
      forAjax: function(callback) {
        $.active === 0 ? callback() : $(document).one('ajaxStop', function() { zhain.ext.wait.forAjax(callback) })
      },
      forThrottledAjax: function(callback) {
        $(document).one('ajaxSend', function() { zhain.ext.wait.forAjax(callback) })
      },
      forTransitionEnd: function($locator, callback) {
        $($locator.selector).one('transitionEnd webkitTransitionEnd oTransitionEnd msTransitionEnd', function() { callback() })
      },
      forAnimations: function(callback) {
        zhain.ext.wait.until(function() { return $(":animated").length === 0 }, callback)
      },
      untilVisible: function($locator, callback) {
        zhain.ext.wait.until(function() { return $($locator.selector).is(':visible') }, callback)
      },
      untilHidden: function($locator, callback) {
        zhain.ext.wait.until(function() { return !$($locator.selector).is(':visible') }, callback)
      },
      untilExists: function($locator, callback) {
        zhain.ext.wait.until(function() { return $($locator.selector).length > 0 }, callback)
      },
      until: function(conditionFn, callback) {
        var that = this
        if (conditionFn.call(that)) {
          callback()
        } else {
          setTimeout(function() {
            zhain.ext.wait.until.call(that, conditionFn, callback)
          }, 10)
        }
      }
    },
    sync: {
      breakpoint: function() {
        debugger
      },
      enterVal: function($input, val) {
        $($input.selector).val(val)
      },
      enterValAndKeyupBlur: function($input, val) {
        $($input.selector).val(val).trigger('keyup').trigger('blur')
      },
      enterValAndKeyupChange: function($input, val) {
        $($input.selector).val(val).trigger('keyup').trigger('change')
      },
      click: function($selector) {
        $($selector.selector).click()
      },
      assertVal: function($locator, val) {
        zhain.ext.assert.equal($($locator.selector).val(), val)
      },
      assertDisabled: function($locator) {
        zhain.ext.assert.isTrue($($locator.selector).is(':disabled'), '$("' + $locator.selector + '") should be disabled')
      },
      assertEnabled: function($locator) {
        zhain.ext.assert.isFalse($($locator.selector).is(':disabled'), '$("' + $locator.selector + '") should be enabled')
      },
      assertText: function($locator, txt) {
        zhain.ext.assert.equal($($locator.selector).text(), txt)
      },
      assertHtml: function($locator, html) {
        zhain.ext.assert.equal($($locator.selector).html(), html)
      },
      assertVisible: function($locator) {
        zhain.ext.assert.isTrue($($locator.selector).is(':visible'), '$("' + $locator.selector + '") should be visible')
      },
      assertNotVisible: function($locator) {
        zhain.ext.assert.isFalse($($locator.selector).is(':visible'), '$("' + $locator.selector + '") should not be visible')
      },
      assertHidden: function($locator) {
        zhain.ext.assert.isTrue($($locator.selector).is(':hidden'), '$("' + $locator.selector + '") should be hidden')
      },
      assertDoesNotExist: function($locator) {
        zhain.ext.assert.equal($($locator.selector).length, 0, '$("' + $locator.selector + '") should not exist')
      },
      assertCount: function($locator, count) {
        zhain.ext.assert.equal($($locator.selector).length, count, '$("' + $locator.selector + '").length')
      },
      assertEmpty: function($locator) {
        zhain.ext.assert.isTrue($($locator.selector).is(':empty'), '$("' + $locator.selector + '") should be empty')
      },
      assertNotEmpty: function($locator) {
        zhain.ext.assert.isFalse($($locator.selector).is(':empty'), '$("' + $locator.selector + '") should not be empty')
      },
      assertHasClass: function($locator, clazz) {
        zhain.ext.assert.isTrue($($locator.selector).hasClass(clazz), '$("' + $locator.selector + '") should have class "' + clazz + '"')
      },
      assertNoClass: function($locator, clazz) {
        zhain.ext.assert.isFalse($($locator.selector).hasClass(clazz), '$("' + $locator.selector + '") shouldn\'t have class "' + clazz + '"')
      },
      assertChecked: function($locator) {
        zhain.ext.assert.isTrue($($locator.selector).is(':checked'), '$("' + $locator.selector + '") should be checked')
      },
      assertNotChecked: function($locator) {
        zhain.ext.assert.isFalse($($locator.selector).is(':checked'), '$("' + $locator.selector + '") should not be checked')
      },
      logAjax: function() {
        $(document).ajaxSend(log).ajaxComplete(log)

        function log(e, jqXHR, opts) {
          var header = (e.type == 'ajaxComplete') ? 'DONE ' : ''
          console.log(header + opts.type + ' ' + opts.url)
        }
      }
    },
    async: {
      enterThrottledVal: function($input, val, done) {
        zhain.ext.sync.enterValAndKeyupBlur($input, val, done)
        zhain.ext.wait.forThrottledAjax(done)
      },
      ajaxClick: function($selector, done) {
        $($selector.selector).click()
        zhain.ext.wait.forAjax(done)
      },
      throttledAjaxClick: function($selector, done) {
        $($selector.selector).click()
        zhain.ext.wait.forThrottledAjax(done)
      },
      ajaxTrigger: function($selector, event, done) {
        $($selector.selector).trigger(event)
        zhain.ext.wait.forAjax(done)
      }
    },
    register: function() {
      Object.keys(zhain.ext.wait).forEach(function(fnName) {
        zhain.ext.registerAsync('wait' + toTitleCase(fnName), zhain.ext.wait[fnName])
      })
      Object.keys(zhain.ext.sync).forEach(function(fnName) {
        zhain.ext.registerSync(fnName, zhain.ext.sync[fnName])
      })
      Object.keys(zhain.ext.async).forEach(function(fnName) {
        zhain.ext.registerAsync(fnName, zhain.ext.async[fnName])
      })

      function toTitleCase(s) {
        return s.replace(/(?:^|\s|-)\S/g, function(c) { return c.toUpperCase() })
      }
    },
    registerSync: function(name, fn) {
      Zhain.prototype[name] = function() {
        var args = Array.prototype.slice.call(arguments)
        return this.do(function() { fn.apply(this, args) })
      }
    },
    registerAsync: function(name, fn) {
      Zhain.prototype[name] = function() {
        var args = Array.prototype.slice.call(arguments)
        return this.do(function(invokedArgs) {
          var done = arguments[arguments.length - 1]
          fn.apply(this, args.concat([done]))
        })
      }
    }

  }
  return {}
}
