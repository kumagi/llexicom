require 'json'
require_relative './gemini_client'
require_relative './build'

keys = JSON.parse(File.open("secret.json").read)
build(Proc.new {GeminiClient.new(keys["gemini_key"])} )
