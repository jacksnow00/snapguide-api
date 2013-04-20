require 'sinatra'
require_relative 'guide'

class Application < Sinatra::Base
  get '/' do
    haml :index
  end

  get '/get_guide' do
    uuid = params["uuid"]
    response = HTTParty.get "http://snapguide.com/api/v1/guide/#{uuid}"
    if response.is_a?(Hash) && (response["success"] == true)
      @guide = Guide.new(response["guide"])
      haml :_guide
    else
      [404, {}, 'Sorry, something went wrong']
    end
  end

  def generate_mini_guide(full_guide)
    mini_guide_keys = ["author", "media"]
    mini_guide = full_guide["guide"].select{|k,v| mini_guide_keys.include? k}
    JSON.generate(mini_guide)
  end
end
