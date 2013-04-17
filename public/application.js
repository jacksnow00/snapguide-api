(function() {
  var Guide, guide_one, images, key, main_content, new_image, url;

  Guide = (function() {
    function Guide(guide) {
      this.guide = guide;
    }

    Guide.prototype.images = function() {
      return this.guide.media;
    };

    return Guide;

  })();

  guide_one = new Guide(JSON.parse(window.guides[0]));

  images = guide_one.images();

  for (key in images) {
    url = images[key].url;
    url = url.replace('original', '300x294_ac');
    new_image = "<img src=\"" + url + "\"/>";
    main_content = document.getElementById("main-content");
    main_content.insertAdjacentHTML('afterend', new_image);
  }

}).call(this);
