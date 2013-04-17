class Guide
  constructor: (@guide) ->

  images: ->
    @guide.media

guide_one = new Guide(JSON.parse(window.guides[0]))
images = guide_one.images()
for key of images
  url = images[key].url
  url = url.replace('original', '300x294_ac')
  new_image = "<img src=\"#{url}\"/>"
  main_content = document.getElementById("main-content")
  main_content.insertAdjacentHTML('afterend', new_image)
