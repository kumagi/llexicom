BASE="dict/en/ja"

def encode_filename(word)
  word.gsub(/[A-Z]/) { |c| "_#{c}_" }
end

def decode_filename(encoded)
  encoded.gsub(/_([A-Z])_/) { $1 }
end

words = Dir.glob("*", base: BASE).select{|w|
  /[A-Z]/.match(w)
}.sort

words.each{|w|
  new_filename = encode_filename(w)

  # Dry run.
  puts "rename #{BASE}/#{w} to #{BASE}/#{new_filename}"
  # `mv #{BASE}/#{w} #{BASE}/#{new_filename}`
}

