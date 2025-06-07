require 'json'
require_relative './gemini_client'

key = JSON.parse(File.open("secret.json").read)["gemini_key"]

all = Dir.glob("*", base: "dict/en/ja").sort
words = all.reject {|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}
words.shuffle!

workers = []
m = Mutex.new

workers = 30.times.map {
  Thread.new {
    cli = GeminiClient.new(key)
    loop do
      m.lock
      if words.length == 0
        m.unlock
        break
      end
      word = words.pop
      m.unlock

      retried = 0
      begin
        dest = "dict/en/ja/#{word}/data.json"
        next if File.exist?(dest)
        File.open("dict/en/ja/#{word}/data.json", "w") {|f|
          data = cli.prompt(word)
          f.write(data.to_json)
        }
      rescue => e
        pp e
        pp e.backtrace
        retried += 1
        if retried < 6
          puts "retrying #{word} as #{e}"
          retry
        end
        puts "compromised #{word}"
      end
    end
  }
}
workers.each{|w| w.join }
