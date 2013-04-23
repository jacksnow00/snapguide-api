require 'capybara'
require 'capybara-webkit'
require 'capybara/rspec'
require 'httparty'
require 'vcr'
require 'haml'
require_relative '../main'

Capybara.javascript_driver = :webkit
Capybara.app = Sinatra::Application
Capybara.ignore_hidden_elements = true

set :environment, :test

RSpec.configure do |config|
  config.treat_symbols_as_metadata_keys_with_true_values = true
  config.run_all_when_everything_filtered = true
  config.filter_run :focus
  config.order = 'random'
end

VCR.configure do |config|
  config.default_cassette_options = { record: :new_episodes }
  config.cassette_library_dir = 'fixtures/vcr_cassettes'
  config.hook_into :webmock
  config.ignore_localhost = true
  config.configure_rspec_metadata!
end
