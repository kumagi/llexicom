require 'json'

words = `ls dict/en/ja/`.split("\n")
words.reject!{|w|
  /^[a-zA-Z]+$/
}
pp words
