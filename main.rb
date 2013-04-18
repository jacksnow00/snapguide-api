require 'sinatra'

class Application < Sinatra::Base
  get '/' do
    response = HTTParty.get 'http://snapguide.com/api/v1/guide/b995492d5e7943e3b2757a88fe3ef7c6'
    @guide_json = generate_mini_guide(response)
    @guide = Guide.new(response["guide"])
    haml :index
  end

  def generate_mini_guide(full_guide)
    mini_guide_keys = ["author", "media"]
    mini_guide = full_guide["guide"].select{|k,v| mini_guide_keys .include? k}
    JSON.generate(mini_guide)
  end
end

class Guide
  attr_reader :title, :summary

  def initialize(json)
    @title = json["metadata"]["title"]
    @summary = json["metadata"]["summary"]
    @first_name = json["author"]["first_name"]
    @last_name = json["author"]["last_name"]
    @main_image_id = json["metadata"]["main_image_uuid"]
    @media_hash = json["media"]
  end

  def author
    "#{@first_name} #{@last_name}"
  end

  def main_image_url
    @media_hash[@main_image_id]["url"].gsub('original', '610x340_ac')
  end
end
