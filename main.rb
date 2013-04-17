require 'sinatra'

class Application < Sinatra::Base
  get '/' do
    @items = [1,2,3]
    haml :index
  end
end
