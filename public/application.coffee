window.onload = ->
  GuideFetcher.init()

class GuideFetcher
  constructor: ->
    @xhr = null
    @findGuide = document.getElementById("find-guide")
    @loading = @findGuide.getElementsByClassName('loading')[0]

  @.init = ->
    (new GuideFetcher).handleSubmit()

  uuid: ->
    document.getElementById('guide-uuid').value

  handleSubmit: ->
    guide_form = document.getElementById('guide-form')
    guide_form.onsubmit = (e) =>
      e.preventDefault()
      @.fetchGuide()

  fetchGuide: ->
    @xhr?.abort()
    @xhr = new XMLHttpRequest
    url = "/get_guide?uuid=#{@uuid()}"

    @xhr.open 'GET', url, true
    @.setHeaders()
    @.setupCallbacks()
    @xhr.send()

  setHeaders: ->
    @xhr.setRequestHeader 'Accept',
      'application/json, text/javascript'
    @xhr.setRequestHeader 'X-XHR-Referer', document.location.href

  setupCallbacks: ->
    @xhr.onloadstart = => @.showLoading()
    @xhr.onload = => @.handleResponse()
    @xhr.onloadend = -> @xhr = null

  showLoading: ->
    @loading.removeClass 'hidden'

  handleResponse: ->
    @.parseResponse()
    @.removeLoading()

  removeLoading: ->
    @loading.addClass 'hidden'

  parseResponse: ->
    if @xhr.status == 200
      json = JSON.parse(@xhr.response)
      guide = new Guide json
      view = new GuideView guide
      view.render()
      @.storeGuide(guide)
    else if @xhr.status == 404
      response = JSON.parse(@xhr.response)
      alert response.message

  storeGuide: (guide) ->
    unless window.guides.hasOwnProperty(@uuid())
      Object.defineProperty(window.guides, @uuid(), {value: guide})

class Guide
  constructor: (@json) ->
    @uuid = @json.uuid
    @summary = @json.metadata.summary
    @author = @json.author.name

  title: =>
    "How to #{@json.metadata.title}"

  mainImage: (opts) ->
    (new Image @json.publish_main_image_uuid).size(opts.size)

  image: (opts) ->
    (new Image opts.uuid).size(opts.size)

  steps: =>
    items = @json.items.filter (e)-> ['image', 'video'].indexOf(e.type) >= 0
    items

  stepCount: =>
    @.steps().length

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

class GuideView
  constructor: (@guide) ->

  guides: =>
    document.getElementById("guides")

  templateGuide: =>
    @guides().getElementsByClassName('guide template')[0]

  render: =>
    @.copyTemplateGuide()
    @.setGuideContent()
    @.bindEvents()

  copyTemplateGuide: =>
    guideTemplate = @templateGuide()
    newGuide = guideTemplate.outerHTML
    @guides().insertAdjacentHTML('afterbegin', newGuide)

  setGuideContent: =>
    newGuide = @templateGuide()
    newGuide.setAttribute 'data-uuid', @guide.uuid
    @.setContent(newGuide, 'summary', @guide.summary)
    @.setContent(newGuide, 'title', @guide.title())
    @.setContent(newGuide, 'author', "by #{@guide.author}")
    img = newGuide.getElementsByTagName('img')[0]
    img.setAttribute 'src', @guide.mainImage size: 'featured'
    newGuide.removeClass('template')

  setContent: (node, className, text) =>
    node.getElementsByClassName(className)[0].innerText = text

  bindEvents: =>
    startGuide = document.getElementsByClassName('start-guide')[0]
    startGuide.onclick = (e) ->
      e.preventDefault()
      uuid = @.parentNode.getAttribute('data-uuid')
      guideViewer = new GuideViewer window.guides[uuid]
      guideViewer.start()

class GuideViewer
  constructor: (@guide) ->
    @overlay = document.getElementById 'guide-overlay'
    @viewer = document.getElementById 'guide-viewer'
    @instructions = @viewer.getElementsByClassName('instructions')[0]
    @currentStepIndex = 0
    @lastStepIndex = @guide.stepCount() - 1
    @previous = @viewer.getElementsByClassName('previous')[0]
    @next = @viewer.getElementsByClassName('next')[0]

  currentStep: =>
    @guide.steps()[@currentStepIndex]

  start: =>
    @.refreshContent()
    @.reveal()
    @.bindEvents()

  refreshContent: =>
    uuid = @.currentStep().content.media_item_uuid
    @instructions.innerText = @.currentStep().content.caption

    currentImage = @viewer.getElementsByTagName('img')[0]
    currentImage.setAttribute('src', @guide.image uuid: uuid, size: 'guide')

    @.setInstructionsSize()
    @.showHideControls()
    @.updateStepNumber()

  setInstructionsSize: =>
    chars = @.currentStep().content.caption.length
    if chars > 125
      @instructions.addClass 'chars-125'
    else if chars > 50
      @instructions.addClass 'chars-50'
    else
      @instructions.removeClass 'chars-125'
      @instructions.removeClass 'chars-50'

  showHideControls: =>
    if @.onFirstStep()
      @previous.addClass 'hidden'
    else if @.onLastStep()
      @next.addClass 'hidden'
    else
      for link in [@previous, @next]
        link.removeClass 'hidden'

  updateStepNumber: =>
    stepNumber = @viewer.getElementsByClassName('step-no')[0]
    stepNumber.innerText = "#{@currentStepIndex + 1} of #{@lastStepIndex + 1}"
    if @.onFirstStep()
      stepNumber.setAttribute('style', "")
    if @.percentDone() > 12
      roundedPercent = Math.round(@.percentDone())
      stepNumber.setAttribute('style', "width: #{roundedPercent}%;")

  percentDone: =>
    (@currentStepIndex / @lastStepIndex) * 100

  reveal: =>
    @overlay.removeClass 'hidden'
    @viewer.removeClass 'hidden'

  bindEvents: =>
    @overlay.onclick = =>
      @.hideSlideShow()
    @previous.onclick = (e) =>
      e.preventDefault()
      @.previousStep()
    @next.onclick = (e) =>
      e.preventDefault()
      @.nextStep()
    document.onkeyup = (e) =>
      if e.keyCode == 27  # escape
        @.hideSlideShow()
      else if e.keyCode == 37  # left arrow
        @.previousStep()
      else if e.keyCode == 39  # right arrow
        @.nextStep()

  hideSlideShow: =>
    @overlay.addClass 'hidden'
    @viewer.addClass 'hidden'

  nextStep: =>
    unless @.onLastStep()
      @currentStepIndex += 1
      @.refreshContent()

  onLastStep: =>
    @currentStepIndex == @lastStepIndex

  previousStep: =>
    unless @.onFirstStep()
      @currentStepIndex -= 1
      @.refreshContent()

  onFirstStep: =>
    @currentStepIndex == 0

Object::removeClass = (klass) ->
  if @.hasOwnProperty('classList')
    @.classList.remove klass

Object::addClass = (klass) ->
  if @.hasOwnProperty('classList')
    @.classList.add klass
