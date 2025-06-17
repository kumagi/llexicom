require 'json'
require_relative './deepseek_client'
require_relative './build'

keys = JSON.parse(File.open("secret.json").read)
build(Proc.new {DeepseekClient.new(keys["deepseek_key"])}, 100)
