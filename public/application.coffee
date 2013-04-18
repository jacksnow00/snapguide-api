class Guide
  constructor: (@guide) ->

  media: ->
    @guide.media




guide_one = new Guide(JSON.parse(window.guides[0]))
media = guide_one.media()

for key of media
  break
  type = media[key].type
  if type.match /image/
    url = media[key].url
    url = url.replace('original', '300x294_ac')
    new_image = "<img src=\"#{url}\"/>"
    main_content = document.getElementById("main-content")
    main_content.insertAdjacentHTML('afterend', new_image)
