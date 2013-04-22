(function() {
  var Guide, GuideFetcher, GuideViewer, Image,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  GuideFetcher = (function() {
    var bindEvents, copyTemplateGuide, fetchGuide, handleResponse, handleSubmit, parseResponse, removeLoading, removeLoadingGuide, setContent, setGuideContent, setHeaders, setupCallbacks, setupGuide, showLoading, storeGuide;

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
        return handleResponse();
      };
      return this.xhr.onloadend = function() {
        return this.xhr = null;
      };
    };

    showLoading = function() {
      var findGuide;

      findGuide = document.getElementById("find-guide");
      this.loading = findGuide.getElementsByClassName('loading')[0];
      return this.loading.removeClass('hidden');
    };

    handleResponse = function() {
      parseResponse();
      return removeLoading();
    };

    removeLoading = function() {
      return this.loading.addClass('hidden');
    };

    parseResponse = function() {
      var guide, json;

      if (this.xhr.status === 200) {
        json = JSON.parse(this.xhr.response);
        guide = new Guide(json);
        setupGuide(guide);
        bindEvents();
        return storeGuide(guide);
      } else if (this.xhr.status === 404) {
        alert('Sorry, something went wrong');
        return removeLoadingGuide();
      }
    };

    removeLoadingGuide = function() {
      var guides, loadingGuide;

      guides = document.getElementById("guides");
      loadingGuide = guides.firstChild;
      loadingGuide.addClass('fade-out');
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
      img.setAttribute('src', guide.mainImage({
        size: 'featured'
      }));
      return newGuideNode.removeClass('template');
    };

    setContent = function(node, className, text) {
      return node.getElementsByClassName(className)[0].innerText = text;
    };

    bindEvents = function() {
      var startGuide;

      startGuide = document.getElementsByClassName('start-guide')[0];
      return startGuide.onclick = function() {
        var guideViewer, uuid;

        uuid = this.parentNode.getAttribute('data-uuid');
        guideViewer = new GuideViewer(window.guides[uuid]);
        guideViewer.start();
        return false;
      };
    };

    storeGuide = function(guide) {
      if (!window.guides.hasOwnProperty(uuid)) {
        return Object.defineProperty(window.guides, guide.uuid, {
          value: guide
        });
      }
    };

    return GuideFetcher;

  })();

  Image = (function() {
    function Image(uuid) {
      this.uuid = uuid;
      this.size = __bind(this.size, this);
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
          case size !== 'guide':
            return '440x380_ac';
          case size !== 'featured':
            return '610x340_ac';
        }
      })();
      return url.replace(/original/, imageSize);
    };

    return Image;

  })();

  Guide = (function() {
    function Guide(json) {
      this.json = json;
      this.stepCount = __bind(this.stepCount, this);
      this.steps = __bind(this.steps, this);
      this.uuid = this.json.uuid;
      this.title = this.json.metadata.title;
      this.summary = this.json.metadata.summary;
      this.author = this.json.author.name;
    }

    Guide.prototype.mainImage = function(opts) {
      return (new Image(this.json.publish_main_image_uuid)).size(opts.size);
    };

    Guide.prototype.image = function(opts) {
      return (new Image(opts.uuid)).size(opts.size);
    };

    Guide.prototype.steps = function() {
      var items;

      items = this.json.items.filter(function(e) {
        return ['image', 'video'].indexOf(e.type) >= 0;
      });
      return items;
    };

    Guide.prototype.stepCount = function() {
      return this.steps().length;
    };

    return Guide;

  })();

  GuideViewer = (function() {
    function GuideViewer(guide) {
      this.guide = guide;
      this.onFirstStep = __bind(this.onFirstStep, this);
      this.previousStep = __bind(this.previousStep, this);
      this.onLastStep = __bind(this.onLastStep, this);
      this.nextStep = __bind(this.nextStep, this);
      this.hideSlideShow = __bind(this.hideSlideShow, this);
      this.bindEvents = __bind(this.bindEvents, this);
      this.reveal = __bind(this.reveal, this);
      this.showHideControls = __bind(this.showHideControls, this);
      this.setInstructionsSize = __bind(this.setInstructionsSize, this);
      this.refreshContent = __bind(this.refreshContent, this);
      this.start = __bind(this.start, this);
      this.currentStep = __bind(this.currentStep, this);
      this.overlay = document.getElementById('guide-overlay');
      this.viewer = document.getElementById('guide-viewer');
      this.instructions = this.viewer.getElementsByClassName('instructions')[0];
      this.currentImage = this.viewer.getElementsByTagName('img')[0];
      this.currentStepIndex = 0;
      this.lastStepIndex = this.guide.stepCount() - 1;
      this.previous = this.viewer.getElementsByClassName('previous')[0];
      this.next = this.viewer.getElementsByClassName('next')[0];
      this.stepNumber = this.viewer.getElementsByClassName('step-no')[0];
    }

    GuideViewer.prototype.currentStep = function() {
      return this.guide.steps()[this.currentStepIndex];
    };

    GuideViewer.prototype.start = function() {
      this.refreshContent();
      this.reveal();
      return this.bindEvents();
    };

    GuideViewer.prototype.refreshContent = function() {
      var uuid;

      uuid = this.currentStep().content.media_item_uuid;
      this.instructions.innerText = this.currentStep().content.caption;
      this.currentImage.setAttribute('src', this.guide.image({
        uuid: uuid,
        size: 'guide'
      }));
      this.setInstructionsSize();
      this.showHideControls();
      return this.stepNumber.innerText = "" + (this.currentStepIndex + 1) + " of " + (this.lastStepIndex + 1);
    };

    GuideViewer.prototype.setInstructionsSize = function() {
      var chars;

      chars = this.currentStep().content.caption.length;
      if (chars > 125) {
        return this.instructions.addClass('chars-125');
      } else {
        return this.instructions.removeClass('chars-125');
      }
    };

    GuideViewer.prototype.showHideControls = function() {
      var link, _i, _len, _ref, _results;

      if (this.onFirstStep()) {
        return this.previous.addClass('hidden');
      } else if (this.onLastStep()) {
        return this.next.addClass('hidden');
      } else {
        _ref = [this.previous, this.next];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          link = _ref[_i];
          _results.push(link.removeClass('hidden'));
        }
        return _results;
      }
    };

    GuideViewer.prototype.reveal = function() {
      this.overlay.removeClass('hidden');
      return this.viewer.removeClass('hidden');
    };

    GuideViewer.prototype.bindEvents = function() {
      var _this = this;

      this.overlay.onclick = function() {
        return _this.hideSlideShow();
      };
      this.previous.onclick = function(e) {
        e.preventDefault();
        return _this.previousStep();
      };
      return this.next.onclick = function(e) {
        e.preventDefault();
        return _this.nextStep();
      };
    };

    GuideViewer.prototype.hideSlideShow = function() {
      this.overlay.addClass('hidden');
      return this.viewer.addClass('hidden');
    };

    GuideViewer.prototype.nextStep = function() {
      if (!this.onLastStep()) {
        this.currentStepIndex += 1;
        return this.refreshContent();
      }
    };

    GuideViewer.prototype.onLastStep = function() {
      return this.currentStepIndex === this.lastStepIndex;
    };

    GuideViewer.prototype.previousStep = function() {
      if (!this.onFirstStep()) {
        this.currentStepIndex -= 1;
        return this.refreshContent();
      }
    };

    GuideViewer.prototype.onFirstStep = function() {
      return this.currentStepIndex === 0;
    };

    return GuideViewer;

  })();

  Object.prototype.removeClass = function(klass) {
    if (this.hasOwnProperty('classList')) {
      return this.classList.remove(klass);
    }
  };

  Object.prototype.addClass = function(klass) {
    if (this.hasOwnProperty('classList')) {
      return this.classList.add(klass);
    }
  };

  window.onload = function() {
    return GuideFetcher.init();
  };

}).call(this);
