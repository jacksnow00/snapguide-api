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
      'application/json, text/javascript'
    @xhr.setRequestHeader 'X-XHR-Referer', document.location.href

  setupCallbacks = ->
    @xhr.onloadstart = => showLoading()
    @xhr.onload = => handleResponse()
    @xhr.onloadend = -> @xhr = null

  showLoading = ->
    findGuide = document.getElementById("find-guide")
    @loading = findGuide.getElementsByClassName('loading')[0]
    @loading.classList.remove 'hidden'

  handleResponse = ->
    parseResponse()
    removeLoading()

  removeLoading = ->
    @loading.classList.add 'hidden'

  parseResponse = ->
    if @xhr.status == 200
      json = JSON.parse(@xhr.response)
      guide = new Guide json
      setupGuide(guide)
      bindEvents()
      storeGuide(guide)
    else if @xhr.status == 404
      alert 'Sorry, something went wrong'
      removeLoadingGuide()

  removeLoadingGuide = ->
    guides = document.getElementById("guides")
    loadingGuide = guides.firstChild
    loadingGuide.classList.add('fade-out')
    setTimeout (-> guides.removeChild(loadingGuide)), 1000

  setupGuide = (guide) ->
    copyTemplateGuide()
    setGuideContent(guide)

  copyTemplateGuide = ->
    templateGuide = document.getElementById("guides").getElementsByClassName('guide template')[0]
    newGuide = templateGuide.outerHTML
    guides.insertAdjacentHTML('afterbegin', newGuide)

  setGuideContent = (guide) ->
    newGuideNode = document.getElementById("guides").getElementsByClassName('guide template')[0]
    newGuideNode.setAttribute 'data-uuid', guide.uuid
    for attr in ['title', 'summary', 'author']
      setContent(newGuideNode, attr, guide[attr])
    img = newGuideNode.getElementsByTagName('img')[0]
    img.setAttribute 'src', guide.mainImage size: 'featured'
    newGuideNode.classList.remove('template')

  setContent = (node, className, text) ->
    node.getElementsByClassName(className)[0].innerText = text

  bindEvents = ->
    startGuide = document.getElementsByClassName('start-guide')[0]
    startGuide.onclick = ->
      uuid = this.parentNode.getAttribute('data-uuid')
      guideViewer = new GuideViewer window.guides[uuid]
      guideViewer.start()
      false

  storeGuide = (guide) ->
    unless window.guides.hasOwnProperty(uuid)
      Object.defineProperty(window.guides, guide.uuid, {value: guide})

class Image
  constructor: (@uuid) ->

  size: (size) =>
    url = "http://images.snapguide.com/images/guide/#{@uuid}/original.jpg"
    imageSize = switch
      when size == 'thumb'    then '60x60_ac'
      when size == 'small'    then '300x294_ac'
      when size == 'medium'   then '580x296_ac'
      when size == 'guide'   then '440x380_ac'
      when size == 'featured' then '610x340_ac'
    url.replace(/original/, imageSize)

class Guide
  constructor: (@json) ->
    @uuid = @json.uuid
    @title = @json.metadata.title
    @summary = @json.metadata.summary
    @author = @json.author.name

  mainImage: (opts) ->
    (new Image @json.publish_main_image_uuid).size(opts.size)

  image: (opts) ->
    (new Image opts.uuid).size(opts.size)

  steps: =>
    items = @json.items.filter (e)-> ['image', 'video'].indexOf(e.type) >= 0
    items

class GuideViewer
  constructor: (@guide) ->
    @overlay = document.getElementById 'guide-overlay'
    @viewer = document.getElementById 'guide-viewer'
    @instructions = @viewer.getElementsByClassName('instructions')[0]
    @currentImage = @viewer.getElementsByTagName('img')[0]
    @currentStepIndex = 0

  currentStep: =>
    @guide.steps()[@currentStepIndex]

  start: =>
    @.refreshContent()
    @.reveal()
    @.bindEvents()

  refreshContent: =>
    uuid = @.currentStep().content.media_item_uuid
    @instructions.innerText = @.currentStep().content.caption
    @currentImage.setAttribute('src', @guide.image uuid: uuid, size: 'guide')
    @.setInstructionsSize()

  setInstructionsSize: =>
    chars = @.currentStep().content.caption.length
    if chars > 125
      @instructions.classList.add 'chars-125'
    else
      @instructions.classList.remove 'chars-125'

  reveal: =>
    @overlay.classList.remove 'hidden'
    @viewer.classList.remove 'hidden'

  bindEvents: =>
    @overlay.onclick = =>
      @.hideSlideShow()
    previous = @viewer.getElementsByClassName('previous')[0]
    previous.onclick = =>
      @.previousStep()
    next = @viewer.getElementsByClassName('next')[0]
    next.onclick = =>
      @.nextStep()

  hideSlideShow: =>
    @overlay.classList.add 'hidden'
    @viewer.classList.add 'hidden'

  nextStep: =>
    @currentStepIndex += 1
    @.refreshContent()

  previousStep: =>
    @currentStepIndex -= 1
    @.refreshContent()

window.onload = ->
  GuideFetcher.init()
