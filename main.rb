require 'sinatra'
require 'json'
require_relative 'guide'

class Application < Sinatra::Base
  get '/' do
    haml :index
  end

  get '/get_guide' do
    content_type :json

    guide_json = fetch_guide(params["uuid"])
    if guide_json
      guide_json.to_json
    else
      [404, {}, 'Sorry, something went wrong']
    end
  end

  def fetch_guide(uuid)
    response = HTTParty.get "http://snapguide.com/api/v1/guide/#{uuid}"
    if response.is_a?(Hash) && (response["success"] == true)
      guide = response["guide"]
      guide
    end
  end
end
