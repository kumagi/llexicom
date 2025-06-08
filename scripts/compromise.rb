require 'json'

BASE="dict/en/ja"
words = Dir.glob("*", base: BASE).sort

words.reject {|w|
  File.exist?("#{BASE}/#{w}/data.json")
}.each{|w|
  `rm -rf #{BASE}/#{w}`
}

words.select {|w|
  /^[_\-a-zA-Z]+$/.match(w).nil?
}.each{|w|
  `rm -rf #{BASE}/#{w}`
}
