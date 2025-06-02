require 'json'

words = `ls dict/en/ja/`.split("\n")

new_words = []

words.each{|w|
  path = "dict/en/ja/#{w}/data.json"
  unless File.exist?(path)
    next
  end
  desc = JSON.parse(File.open(path).read)
  if desc.class != Hash || desc['meanings'].class != Array
    next
  end
  nyms = desc['meanings'].map{|m|
    ans = []
    if m['synonyms']
      ans += m['synonyms']
    end
    if m['antonyms']
      ans += m['antonyms']
    end
    ans
  }.flatten
  new_words += nyms
  new_words.sort!
  new_words.uniq!
}
new_words -= words
selected = new_words.select{|w|
  w.match(/^[-a-zA-Z]+$/)
}.sort.uniq
pp selected

new_words.select{|w|
  w.match(/^[-a-zA-Z]+$/)
}.sort.uniq.each{|w|
  puts "adding #{w}"
  `mkdir -p dict/en/ja/#{w}`
  `touch dict/en/ja/#{w}/.keep`
}

