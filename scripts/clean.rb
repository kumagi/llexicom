require 'json'

words = Dir.glob("*", base: "dict/en/ja").sort
exists = words.clone.select {|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}

exists.each{|w|
  begin
    result = JSON.parse(File.open("dict/en/ja/#{w}/data.json").read)
    result['word']
  rescue
    puts "cannot read #{w}"
    `rm -rf dict/en/ja/#{w}/data.json`
  end
}
