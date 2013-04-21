require 'sinatra'
require 'redis'
require 'json'
require_relative 'guide'

class Application < Sinatra::Base
  MINI_GUIDE_KEYS = ["author", "media", "items"]
  OTHER_KEYS = ["metadata"]
  ALL_KEYS = MINI_GUIDE_KEYS + OTHER_KEYS

  configure do
    $redis = Redis.new(:host => "localhost", :port => 6379)
  end

  get '/' do
    haml :index
  end

  get '/get_guide' do
    guide_json = fetch_guide(params["uuid"])
    if guide_json
      @guide = Guide.new(guide_json)
      haml :_guide
    else
      [404, {}, 'Sorry, something went wrong']
    end
  end

  get '/get_guide_json' do
    guide_json = fetch_guide(params["uuid"])
    if guide_json
      generate_mini_guide(guide_json)
    end
  end

  def fetch_guide(uuid)
    if cached?(uuid)
      JSON.parse($redis.get("guide:#{uuid}"))
    else
      get_and_cache(uuid)
    end
  end

  def cached?(uuid)
    $redis.exists "guide:#{uuid}"
  end

  def get_and_cache(uuid)
    response = HTTParty.get "http://snapguide.com/api/v1/guide/#{uuid}"
    if response.is_a?(Hash) && (response["success"] == true)
      guide = response["guide"]
      guide.delete_if{|key| !ALL_KEYS.include? key}
      $redis.set "guide:#{uuid}", JSON.fast_generate(guide)
      guide
    end
  end

  def generate_mini_guide(full_guide)
    mini_guide = full_guide.select{|k,v| MINI_GUIDE_KEYS.include? k}
    mini_guide["items"].delete_if{|item| item["type"] == 'step'}
    JSON.fast_generate(mini_guide)
  end
end
