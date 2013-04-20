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
