class GuideFetcher
  this.init = ->
    handleSubmit()

  handleSubmit = ->
    guide_form = document.getElementById('guide-form')
    guide_form.onsubmit = ->
      fetchGuide()
      false

  fetchGuide = ->
    @xhr?.abort()
    @uuid = document.getElementById('guide-uuid').value
    @xhr = new XMLHttpRequest
    url = "/get_guide?uuid=#{uuid}"

    @xhr.open 'GET', url, true
    setHeaders()
    setupCallbacks()
    @xhr.send()

  setHeaders = ->
    @xhr.setRequestHeader 'Accept',
      'text/html, application/xhtml+xml, application/xml'
    @xhr.setRequestHeader 'X-XHR-Referer', document.location.href

  setupCallbacks = ->
    @xhr.onloadstart = => showSpinner()
    @xhr.onload = => parseResponse()
    @xhr.onloadend = -> @xhr = null

  showSpinner = ->
    main_content = document.getElementById("guides")
    guideDiv = "<div class=\"guide\" data-uuid=\"#{@uuid}\"><i class=\"icon-spinner\"></i></div>"
    main_content.insertAdjacentHTML('afterbegin', guideDiv)

  parseResponse = ->
    if @xhr.status == 200
      appendGuide @xhr.response
      bindEvents()
    else if @xhr.status == 404
      removeLoading()

  removeLoading = ->
    alert 'Sorry, something went wrong'
    guides = document.getElementById("guides")
    loadingGuide = guides.firstChild
    loadingGuide.classList.add('fade-out')
    setTimeout (-> guides.removeChild(loadingGuide)), 1000

  appendGuide = (guideHtml) ->
    loadingGuide = document.getElementById("guides").firstChild
    loadingGuide.innerHTML = guideHtml

  bindEvents = ->
    startGuide = document.getElementsByClassName('start-guide')[0]
    startGuide.onclick = ->
      alert this.parentNode.getAttribute('data-uuid')

window.onload = ->
  GuideFetcher.init()







#class GuideController
#
#
#class Guide
#  constructor: (@guide) ->
#
#  media: ->
#    @guide.media

#guide_one = new Guide(JSON.parse(window.guides[0]))
#media = guide_one.media()
#
#for key of media
#  break
#  type = media[key].type
#  if type.match /image/
#    url = media[key].url
#    url = url.replace('original', '300x294_ac')
#    new_image = "<img src=\"#{url}\"/>"
#    main_content = document.getElementById("main-content")
#    main_content.insertAdjacentHTML('afterend', new_image)
