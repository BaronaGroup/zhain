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
    replaceJQuery: function(new$) {
      var old$ = $
      $ = new$
      return old$
    },
    assert: chai.assert,
    wait: {
      forAjax: function(callback) {
        $.active === 0 ? callback() : $(document).one('ajaxStop', function() { zhain.ext.wait.forAjax(callback) })
      },
      forThrottledAjax: function(callback) {
        $(document).one('ajaxSend', function() { zhain.ext.wait.forAjax(callback) })
      },
      forTransitionEnd: function($selector, callback) {
        $($selector || $selector).one('transitionEnd webkitTransitionEnd oTransitionEnd msTransitionEnd', function() { callback() })
      },
      forAnimations: function(callback) {
        zhain.ext.wait.until(function() { return $(":animated").length === 0 }, callback)
      },
      untilVisible: function($selector, callback) {
        zhain.ext.wait.until(function() { return $($selector || $selector).is(':visible') }, callback)
      },
      untilHidden: function($selector, callback) {
        zhain.ext.wait.until(function() { return !$($selector || $selector).is(':visible') }, callback)
      },
      untilExists: function($selector, callback) {
        zhain.ext.wait.until(function() { return $($selector || $selector).length > 0 }, callback)
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
      enterVal: function($selector, val) {
        $($selector.selector || $selector).val(val)
      },
      enterValAndKeyupBlur: function($selector, val) {
        $($selector.selector || $selector).val(val).trigger('keyup').trigger('blur')
      },
      enterValAndKeyupChange: function($selector, val) {
        $($selector.selector || $selector).val(val).trigger('keyup').trigger('change')
      },
      click: function($selector) {
        $($selector.selector || $selector).click()
      },
      assertVal: function($selector, val) {
        zhain.ext.assert.equal($($selector || $selector).val(), val)
      },
      assertDisabled: function($selector) {
        zhain.ext.assert.isTrue($($selector || $selector).is(':disabled'), '$("' + $selector.selector + '") should be disabled')
      },
      assertEnabled: function($selector) {
        zhain.ext.assert.isFalse($($selector || $selector).is(':disabled'), '$("' + $selector.selector + '") should be enabled')
      },
      assertText: function($selector, txt) {
        zhain.ext.assert.equal($($selector || $selector).text(), txt)
      },
      assertHtml: function($selector, html) {
        zhain.ext.assert.equal($($selector || $selector).html(), html)
      },
      assertVisible: function($selector) {
        zhain.ext.assert.isTrue($($selector || $selector).is(':visible'), '$("' + $selector.selector + '") should be visible')
      },
      assertNotVisible: function($selector) {
        zhain.ext.assert.isFalse($($selector || $selector).is(':visible'), '$("' + $selector.selector + '") should not be visible')
      },
      assertHidden: function($selector) {
        zhain.ext.assert.isTrue($($selector || $selector).is(':hidden'), '$("' + $selector.selector + '") should be hidden')
      },
      assertDoesNotExist: function($selector) {
        zhain.ext.assert.equal($($selector || $selector).length, 0, '$("' + $selector.selector + '") should not exist')
      },
      assertCount: function($selector, count) {
        zhain.ext.assert.equal($($selector || $selector).length, count, '$("' + $selector.selector + '").length')
      },
      assertEmpty: function($selector) {
        zhain.ext.assert.isTrue($($selector || $selector).is(':empty'), '$("' + $selector.selector + '") should be empty')
      },
      assertNotEmpty: function($selector) {
        zhain.ext.assert.isFalse($($selector || $selector).is(':empty'), '$("' + $selector.selector + '") should not be empty')
      },
      assertHasClass: function($selector, clazz) {
        zhain.ext.assert.isTrue($($selector || $selector).hasClass(clazz), '$("' + $selector.selector + '") should have class "' + clazz + '"')
      },
      assertNoClass: function($selector, clazz) {
        zhain.ext.assert.isFalse($($selector || $selector).hasClass(clazz), '$("' + $selector.selector + '") shouldn\'t have class "' + clazz + '"')
      },
      assertChecked: function($selector) {
        zhain.ext.assert.isTrue($($selector || $selector).is(':checked'), '$("' + $selector.selector + '") should be checked')
      },
      assertNotChecked: function($selector) {
        zhain.ext.assert.isFalse($($selector || $selector).is(':checked'), '$("' + $selector.selector + '") should not be checked')
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
        return this.do(function() { return fn.apply(this, args) })
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
