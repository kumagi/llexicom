require 'json'

all = `ls dict/en/ja/`.split("\n")

words = all.select{|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}

words.each {|w|
  path = "dict/en/ja/#{w}/data.json"
  data = File.open(path).read
  if data.size <= 10
    File.delete(path)
    puts "removed too small #{w}"
    next
  end
  begin
    JSON.parse(data)
  rescue => e
    pp e
  end
}
