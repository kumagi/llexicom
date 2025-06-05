require 'erb'
require 'json'

TEMPLATE=File.open("templates/en/ja/word.html").read
def load(word)
  def markdown_text(text)
    text.gsub(/\*\*(.*?)\*\*/, '<strong>\1</strong>')
  end  
  @word_data = JSON.parse(File.open("dict/en/ja/#{word}/data.json").read)
  binding
end

words = Dir.glob("*", base: "dict/en/ja")
exists = words.select {|d|
  File.exist?("dict/en/ja/#{d}/data.json")
}

parallels = 50

`mkdir -p docs/common/`
`cp templates/en/ja/word.css docs/common/`
`cp templates/en/ja/word.js docs/common/`

lk = Mutex.new
workers = parallels.times.map {
  Thread.new {
    template = ERB.new(TEMPLATE)
    loop do
      lk.lock()
      if exists.empty?
        lk.unlock()
        break
      end
      w = exists.pop
      lk.unlock
      
      begin
        `mkdir -p docs/en/ja/#{w}`
        File.open("docs/en/ja/#{w}/index.html", "w").write(template.result(load(w)))
        puts "wrote #{w}"
      rescue => e
        pp e
      end
    end
  }
}
workers.each{|w| w.join }
