require 'json'

files = `ls dict/en/ja/*/data.json`.split("\n")

words = `ls dict/en/ja/`.split("\n")

new_words = []
files.each{|f|
  desc = JSON.parse(File.open(f).read)
  unless desc.dig('meanings')
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
  new_words += nyms - words
}
new_words -= words

new_words.select{|w|
  w.match(/^[-a-zA-Z]+$/)
}.sort.uniq.each{|w|
  puts "adding #{w}"
  `mkdir -p dict/en/ja/#{w}`
  `touch dict/en/ja/#{w}/.keep`
}

