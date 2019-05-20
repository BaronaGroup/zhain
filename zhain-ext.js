var chai = require('chai')
var zhain = require('zhain')
var $ = require('jquery')
zhainExt(zhain, chai, $)

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
      forTransitionEnd: function(selector, callback) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).one('transitionEnd webkitTransitionEnd oTransitionEnd msTransitionEnd', function() { callback() })
      },
      forAnimations: function(callback) {
        zhain.ext.wait.until(function() { return $(":animated").length === 0 }, callback)
      },
      untilVisible: function(selector, callback) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.wait.until(function() { return $(selector).is(':visible') }, callback)
      },
      untilHidden: function(selector, callback) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.wait.until(function() { return !$(selector).is(':visible') }, callback)
      },
      untilExists: function(selector, callback) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.wait.until(function() { return $(selector).length > 0 }, callback)
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
        debugger // eslint-disable-line no-debugger
      },
      enterVal: function(selector, val) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).val(val)
      },
      enterValAndKeyupBlur: function(selector, val) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).val(val).trigger('keyup').trigger('blur')
      },
      enterValAndKeyupChange: function(selector, val) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).val(val).trigger('keyup').trigger('change')
      },
      click: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).click()
      },
      assertVal: function(selector, val) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.equal($(selector).val(), val)
      },
      assertDisabled: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).is(':disabled'), '$("' + selector + '") should be disabled')
      },
      assertEnabled: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isFalse($(selector).is(':disabled'), '$("' + selector + '") should be enabled')
      },
      assertText: function(selector, txt) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.equal($(selector).text(), txt)
      },
      assertHtml: function(selector, html) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.equal($(selector).html(), html)
      },
      assertVisible: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).is(':visible'), '$("' + selector + '") should be visible')
      },
      assertNotVisible: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isFalse($(selector).is(':visible'), '$("' + selector + '") should not be visible')
      },
      assertHidden: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).is(':hidden'), '$("' + selector + '") should be hidden')
      },
      assertDoesNotExist: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.equal($(selector).length, 0, '$("' + selector + '") should not exist')
      },
      assertCount: function(selector, count) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.equal($(selector).length, count, '$("' + selector + '").length')
      },
      assertEmpty: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).is(':empty'), '$("' + selector + '") should be empty')
      },
      assertNotEmpty: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isFalse($(selector).is(':empty'), '$("' + selector + '") should not be empty')
      },
      assertHasClass: function(selector, clazz) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).hasClass(clazz), '$("' + selector + '") should have class "' + clazz + '"')
      },
      assertNoClass: function(selector, clazz) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isFalse($(selector).hasClass(clazz), '$("' + selector + '") shouldn\'t have class "' + clazz + '"')
      },
      assertChecked: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isTrue($(selector).is(':checked'), '$("' + selector + '") should be checked')
      },
      assertNotChecked: function(selector) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        zhain.ext.assert.isFalse($(selector).is(':checked'), '$("' + selector + '") should not be checked')
      },
      logAjax: function() {
        $(document).ajaxSend(log).ajaxComplete(log)

        function log(e, jqXHR, opts) {
          var header = (e.type === 'ajaxComplete') ? 'DONE ' : ''
          console.log(header + opts.type + ' ' + opts.url) // eslint-disable-line no-console
        }
      }
    },
    async: {
      enterThrottledVal: function($input, val, done) {
        zhain.ext.sync.enterValAndKeyupBlur($input, val, done)
        zhain.ext.wait.forThrottledAjax(done)
      },
      ajaxClick: function(selector, done) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).click()
        zhain.ext.wait.forAjax(done)
      },
      throttledAjaxClick: function(selector, done) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).click()
        zhain.ext.wait.forThrottledAjax(done)
      },
      ajaxTrigger: function(selector, event, done) {
        if (typeof selector !== 'string') throw new Error('Zhain now requires selectors as strings')
        $(selector).trigger(event)
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
        return this.do(function(invokedArgs) { // eslint-disable-line no-unused-vars
          var done = arguments[arguments.length - 1]
          fn.apply(this, args.concat([done]))
        })
      }
    }

  }
  return {}
}
