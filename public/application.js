(function() {
  var Guide, GuideFetcher, GuideSlideshow, Image;

  GuideFetcher = (function() {
    var bindEvents, copyTemplateGuide, fetchGuide, handleSubmit, parseResponse, removeLoading, setContent, setGuideContent, setHeaders, setupCallbacks, setupGuide, showLoading, storeGuide;

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
      this.xhr.setRequestHeader('Accept', 'application/json, text/javascript');
      return this.xhr.setRequestHeader('X-XHR-Referer', document.location.href);
    };

    setupCallbacks = function() {
      var _this = this;

      this.xhr.onloadstart = function() {
        return showLoading();
      };
      this.xhr.onload = function() {
        return parseResponse();
      };
      return this.xhr.onloadend = function() {
        return this.xhr = null;
      };
    };

    showLoading = function() {};

    parseResponse = function() {
      var guide, json;

      if (this.xhr.status === 200) {
        json = JSON.parse(this.xhr.response);
        guide = new Guide(json);
        setupGuide(guide);
        bindEvents();
        return storeGuide(guide);
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

    setupGuide = function(guide) {
      copyTemplateGuide();
      return setGuideContent(guide);
    };

    copyTemplateGuide = function() {
      var newGuide, templateGuide;

      templateGuide = document.getElementById("guides").getElementsByClassName('guide template')[0];
      newGuide = templateGuide.outerHTML;
      return guides.insertAdjacentHTML('afterbegin', newGuide);
    };

    setGuideContent = function(guide) {
      var attr, img, newGuideNode, _i, _len, _ref;

      newGuideNode = document.getElementById("guides").getElementsByClassName('guide template')[0];
      newGuideNode.setAttribute('data-uuid', guide.uuid);
      _ref = ['title', 'summary', 'author'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        setContent(newGuideNode, attr, guide[attr]);
      }
      img = newGuideNode.getElementsByTagName('img')[0];
      img.setAttribute('src', guide.mainImage.size('featured'));
      return newGuideNode.classList.remove('template');
    };

    setContent = function(node, className, text) {
      return node.getElementsByClassName(className)[0].innerText = text;
    };

    bindEvents = function() {
      var startGuide;

      startGuide = document.getElementsByClassName('start-guide')[0];
      return startGuide.onclick = function() {
        var guideSlideshow, uuid;

        uuid = this.parentNode.getAttribute('data-uuid');
        guideSlideshow = new GuideSlideshow(window.guides[uuid]);
        return guideSlideshow.start();
      };
    };

    storeGuide = function(guide) {
      return Object.defineProperty(window.guides, guide.uuid, {
        value: guide
      });
    };

    return GuideFetcher;

  })();

  Image = (function() {
    function Image(uuid) {
      this.uuid = uuid;
    }

    Image.prototype.size = function(size) {
      var imageSize, url;

      url = "http://images.snapguide.com/images/guide/" + this.uuid + "/original.jpg";
      imageSize = (function() {
        switch (false) {
          case size !== 'thumb':
            return '60x60_ac';
          case size !== 'small':
            return '300x294_ac';
          case size !== 'medium':
            return '580x296_ac';
          case size !== 'featured':
            return '610x340_ac';
        }
      })();
      return url.replace(/original/, imageSize);
    };

    return Image;

  })();

  Guide = (function() {
    function Guide(guide) {
      this.uuid = guide.uuid;
      this.title = guide.metadata.title;
      this.summary = guide.metadata.summary;
      this.author = guide.author.name;
      this.mainImage = new Image(guide.publish_main_image_uuid);
    }

    return Guide;

  })();

  GuideSlideshow = (function() {
    var hideSlideShow;

    function GuideSlideshow(guide) {
      this.guide = guide;
      this.overlay = document.getElementById('guide-overlay');
      this.viewer = document.getElementById('guide-viewer');
    }

    GuideSlideshow.prototype.start = function() {
      var _this = this;

      this.overlay.classList.remove('hidden');
      this.overlay.onclick = function() {
        return hideSlideShow(_this);
      };
      return this.viewer.classList.remove('hidden');
    };

    hideSlideShow = function(show) {
      show.overlay.classList.add('hidden');
      return show.viewer.classList.add('hidden');
    };

    return GuideSlideshow;

  })();

  window.onload = function() {
    return GuideFetcher.init();
  };

}).call(this);
