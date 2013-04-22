(function() {
  var Guide, GuideFetcher, GuideViewer, Image,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  GuideFetcher = (function() {
    function GuideFetcher() {
      this.xhr = null;
      this.findGuide = document.getElementById("find-guide");
      this.loading = this.findGuide.getElementsByClassName('loading')[0];
      this.guideTemplate = this.guides().getElementsByClassName('guide template')[0];
    }

    GuideFetcher.init = function() {
      return (new GuideFetcher).handleSubmit();
    };

    GuideFetcher.prototype.uuid = function() {
      return document.getElementById('guide-uuid').value;
    };

    GuideFetcher.prototype.guides = function() {
      return document.getElementById("guides");
    };

    GuideFetcher.prototype.handleSubmit = function() {
      var guide_form,
        _this = this;

      guide_form = document.getElementById('guide-form');
      return guide_form.onsubmit = function(e) {
        e.preventDefault();
        return _this.fetchGuide();
      };
    };

    GuideFetcher.prototype.fetchGuide = function() {
      var url, _ref;

      if ((_ref = this.xhr) != null) {
        _ref.abort();
      }
      this.xhr = new XMLHttpRequest;
      url = "/get_guide?uuid=" + (this.uuid());
      this.xhr.open('GET', url, true);
      this.setHeaders();
      this.setupCallbacks();
      return this.xhr.send();
    };

    GuideFetcher.prototype.setHeaders = function() {
      this.xhr.setRequestHeader('Accept', 'application/json, text/javascript');
      return this.xhr.setRequestHeader('X-XHR-Referer', document.location.href);
    };

    GuideFetcher.prototype.setupCallbacks = function() {
      var _this = this;

      this.xhr.onloadstart = function() {
        return _this.showLoading();
      };
      this.xhr.onload = function() {
        return _this.handleResponse();
      };
      return this.xhr.onloadend = function() {
        return this.xhr = null;
      };
    };

    GuideFetcher.prototype.showLoading = function() {
      return this.loading.removeClass('hidden');
    };

    GuideFetcher.prototype.handleResponse = function() {
      this.parseResponse();
      return this.removeLoading();
    };

    GuideFetcher.prototype.removeLoading = function() {
      return this.loading.addClass('hidden');
    };

    GuideFetcher.prototype.parseResponse = function() {
      var guide, json, response;

      if (this.xhr.status === 200) {
        json = JSON.parse(this.xhr.response);
        guide = new Guide(json);
        this.setupGuide(guide);
        this.bindEvents();
        return this.storeGuide(guide);
      } else if (this.xhr.status === 404) {
        response = JSON.parse(this.xhr.response);
        return alert(response.message);
      }
    };

    GuideFetcher.prototype.setupGuide = function(guide) {
      this.copyTemplateGuide();
      return this.setGuideContent(guide);
    };

    GuideFetcher.prototype.copyTemplateGuide = function() {
      var newGuide;

      newGuide = this.guideTemplate.outerHTML;
      return this.guides().insertAdjacentHTML('afterbegin', newGuide);
    };

    GuideFetcher.prototype.setGuideContent = function(guide) {
      var img, newGuide;

      newGuide = this.guides().getElementsByClassName('guide template')[0];
      newGuide.setAttribute('data-uuid', this.uuid());
      this.setContent(newGuide, 'summary', guide.summary);
      this.setContent(newGuide, 'title', guide.title());
      this.setContent(newGuide, 'author', "by " + guide['author']);
      img = newGuide.getElementsByTagName('img')[0];
      img.setAttribute('src', guide.mainImage({
        size: 'featured'
      }));
      return newGuide.removeClass('template');
    };

    GuideFetcher.prototype.setContent = function(node, className, text) {
      return node.getElementsByClassName(className)[0].innerText = text;
    };

    GuideFetcher.prototype.bindEvents = function() {
      var startGuide;

      startGuide = document.getElementsByClassName('start-guide')[0];
      return startGuide.onclick = function(e) {
        var guideViewer, uuid;

        e.preventDefault();
        uuid = this.parentNode.getAttribute('data-uuid');
        guideViewer = new GuideViewer(window.guides[uuid]);
        return guideViewer.start();
      };
    };

    GuideFetcher.prototype.storeGuide = function(guide) {
      if (!window.guides.hasOwnProperty(this.uuid())) {
        return Object.defineProperty(window.guides, this.uuid(), {
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
      this.title = __bind(this.title, this);
      this.uuid = this.json.uuid;
      this.summary = this.json.metadata.summary;
      this.author = this.json.author.name;
    }

    Guide.prototype.title = function() {
      return "How to " + this.json.metadata.title;
    };

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
      this.percentDone = __bind(this.percentDone, this);
      this.updateStepNumber = __bind(this.updateStepNumber, this);
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
      return this.updateStepNumber();
    };

    GuideViewer.prototype.setInstructionsSize = function() {
      var chars;

      chars = this.currentStep().content.caption.length;
      if (chars > 125) {
        return this.instructions.addClass('chars-125');
      } else if (chars > 50) {
        return this.instructions.addClass('chars-50');
      } else {
        this.instructions.removeClass('chars-125');
        return this.instructions.removeClass('chars-50');
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

    GuideViewer.prototype.updateStepNumber = function() {
      var roundedPercent;

      this.stepNumber.innerText = "" + (this.currentStepIndex + 1) + " of " + (this.lastStepIndex + 1);
      if (this.onFirstStep()) {
        this.stepNumber.setAttribute('style', "");
      }
      if (this.percentDone() > 12) {
        roundedPercent = Math.round(this.percentDone());
        return this.stepNumber.setAttribute('style', "width: " + roundedPercent + "%;");
      }
    };

    GuideViewer.prototype.percentDone = function() {
      return (this.currentStepIndex / this.lastStepIndex) * 100;
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
      this.next.onclick = function(e) {
        e.preventDefault();
        return _this.nextStep();
      };
      return document.onkeyup = function(e) {
        if (e.keyCode === 27) {
          return _this.hideSlideShow();
        } else if (e.keyCode === 37) {
          return _this.previousStep();
        } else if (e.keyCode === 39) {
          return _this.nextStep();
        }
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
