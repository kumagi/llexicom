all = `ls dict/en/ja/`.split("\n")

words = all.select{|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}

puts "All:\t#{all.size} words"
puts "Filled:\t#{words.size} words"
puts "Empty:\t#{(all - words).size} words"
puts "#{words.size * 100.0 / all.size}% complete"
