require_relative './qwen_client'
require_relative './build'

build(Proc.new {QwenClient.new()}, 10)
