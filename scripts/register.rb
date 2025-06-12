words = File.open(ARGV[0]).read.split("\n").select{|w| w.match(/^[\-A-Za-z]+$/) }


words.each{|w|
  if File.exist?("dict/en/ja/#{w}")
    next
  end
  `mkdir -p dict/en/ja/#{w}`
  `touch dict/en/ja/#{w}/.keep`
}
