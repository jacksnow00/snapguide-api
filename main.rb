require 'sinatra'

class Application < Sinatra::Base
  get '/' do
    response = HTTParty.get 'http://snapguide.com/api/v1/guide/b995492d5e7943e3b2757a88fe3ef7c6'
    desired_keys = ["author", "media"]
    guide = response["guide"].select{|k,v| desired_keys .include? k}
    @guide = JSON.generate(guide)
    haml :index
  end
end
