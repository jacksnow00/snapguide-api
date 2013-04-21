(function() {
  var GuideFetcher;

  GuideFetcher = (function() {
    var appendGuide, bindEvents, fetchGuide, handleSubmit, parseResponse, removeLoading, setHeaders, setupCallbacks, showSpinner;

    function GuideFetcher() {}

    GuideFetcher.init = function() {
      return handleSubmit();
    };

    handleSubmit = function() {
      var guide_form;

      guide_form = document.getElementById('guide-form');
      return guide_form.onsubmit = function() {
        fetchGuide();
        return false;
      };
    };

    fetchGuide = function() {
      var url, _ref;

      if ((_ref = this.xhr) != null) {
        _ref.abort();
      }
      this.uuid = document.getElementById('guide-uuid').value;
      this.xhr = new XMLHttpRequest;
      url = "/get_guide?uuid=" + uuid;
      this.xhr.open('GET', url, true);
      setHeaders();
      setupCallbacks();
      return this.xhr.send();
    };

    setHeaders = function() {
      this.xhr.setRequestHeader('Accept', 'text/html, application/xhtml+xml, application/xml');
      return this.xhr.setRequestHeader('X-XHR-Referer', document.location.href);
    };

    setupCallbacks = function() {
      var _this = this;

      this.xhr.onloadstart = function() {
        return showSpinner();
      };
      this.xhr.onload = function() {
        return parseResponse();
      };
      return this.xhr.onloadend = function() {
        return this.xhr = null;
      };
    };

    showSpinner = function() {
      var guideDiv, main_content;

      main_content = document.getElementById("guides");
      guideDiv = "<div class=\"guide\" data-uuid=\"" + this.uuid + "\"><i class=\"icon-spinner\"></i></div>";
      return main_content.insertAdjacentHTML('afterbegin', guideDiv);
    };

    parseResponse = function() {
      if (this.xhr.status === 200) {
        appendGuide(this.xhr.response);
        return bindEvents();
      } else if (this.xhr.status === 404) {
        return removeLoading();
      }
    };

    removeLoading = function() {
      var guides, loadingGuide;

      alert('Sorry, something went wrong');
      guides = document.getElementById("guides");
      loadingGuide = guides.firstChild;
      loadingGuide.classList.add('fade-out');
      return setTimeout((function() {
        return guides.removeChild(loadingGuide);
      }), 1000);
    };

    appendGuide = function(guideHtml) {
      var loadingGuide;

      loadingGuide = document.getElementById("guides").firstChild;
      return loadingGuide.innerHTML = guideHtml;
    };

    bindEvents = function() {
      var startGuide;

      startGuide = document.getElementsByClassName('start-guide')[0];
      return startGuide.onclick = function() {
        return alert(this.parentNode.getAttribute('data-uuid'));
      };
    };

    return GuideFetcher;

  })();

  window.onload = function() {
    return GuideFetcher.init();
  };

}).call(this);
