require 'sinatra'
require 'json'

class Application < Sinatra::Base
  get '/' do
    haml :index
  end

  get '/get_guide' do
    content_type :json

    begin
      guide_json = fetch_guide(params["uuid"])
      guide_json.to_json
    rescue GuideNotFoundError
      [404, {}, {:message => 'Sorry, that guide was not found'}.to_json]
    end
  end

  def fetch_guide(uuid)
    response = HTTParty.get "http://snapguide.com/api/v1/guide/#{uuid}"
    if response.is_a?(Hash) && (response["success"] == true)
      guide = response["guide"]
      guide
    else
      raise GuideNotFoundError
    end
  end

  class GuideNotFoundError < StandardError; end
end
