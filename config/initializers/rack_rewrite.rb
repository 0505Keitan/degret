if ENV['RACK_ENV'] == 'production'
  Modeler::Application.config.middleware.insert_before(Rack::Runtime, Rack::Rewrite) do
    r301 %r{.*}, 'https://www.degret.net$&', :if => Proc.new {|rack_env|
      rack_env['SERVER_NAME'] == 'degret.herokuapp.com'
    }
  end
end