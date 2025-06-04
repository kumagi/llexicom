require 'erb'
require 'json'

TEMPLATE=File.open("templates/en/ja/word.html").read
def load(word)
  @word_data = JSON.parse(File.open("dict/en/ja/#{word}/data.json").read)
  binding
end

words = Dir.glob("*", base: "dict/en/ja")
exists = words.select {|d|
  File.exist?("dict/en/ja/#{d}/data.json")
}

template = ERB.new(TEMPLATE)

words.each{|w|
  `mkdir -p docs/en/ja/#{w}`
  begin
    File.open("docs/en/ja/#{w}/index.html", "w").write(template.result(load(w)))
    puts "wrote #{w}"
  rescue => e
    pp e
  end
}
