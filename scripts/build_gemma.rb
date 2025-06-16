require_relative './gemma_client'
require_relative './build'

build(Proc.new {GemmaClient.new()}, 10)

