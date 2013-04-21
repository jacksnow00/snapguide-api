class Guide
  attr_reader :title, :summary

  def initialize(json)
    @title = json["metadata"]["title"]
    @summary = json["metadata"]["summary"]
    @name = json["author"]["name"]
    @main_image_id = json["metadata"]["main_image_uuid"]
    @media_hash = json["media"]
  end

  def author
    @name
  end

  def main_image_url
    @media_hash[@main_image_id]["url"].gsub('original', '610x340_ac')
  end
end
