require 'capybara'
require 'capybara-webkit'
require 'capybara/rspec'
require 'httparty'
require_relative '../main'

Capybara.javascript_driver = :webkit
Capybara.app = Sinatra::Application

set :environment, :test

RSpec.configure do |config|
  config.treat_symbols_as_metadata_keys_with_true_values = true
  config.run_all_when_everything_filtered = true
  config.filter_run :focus
  config.order = 'random'
end

