require 'json'
require 'set'
BASE="dict/en/ja"

words = Dir.glob("*", base: BASE).sort.select{|w|
  File.exist?("#{BASE}/#{w}")
}

new_words = []

lk = Mutex.new
parallel = 500

out = parallel.times.map{ Set.new }

workers = parallel.times.map{|n|
  Thread.new{
    loop do
      lk.lock
      if words.empty?
        lk.unlock
        break
      end
      w = words.pop()
      print("\rRest: #{words.size} directories")
      lk.unlock

      path = "#{BASE}/#{w}/data.json"
      desc = JSON.parse(File.open(path).read)
      if desc.class != Hash || desc['meanings'].class != Array
        next
      end
      nyms = desc['meanings'].map{|m|
        ans = []
        if m['synonyms']
          ans += m['synonyms'] and m['synonyms'].class == Array
        end
        if m['antonyms'] and m['antonyms'].class == Array
          ans += m['antonyms']
        end
        ans
      }.flatten
      out[n] += nyms.select{|w|
        w.match(/^[-a-zA-Z]+$/)
      }
    end
  }
}

workers.each{|w| w.join }

new_words = out.map{|m| m.to_a}.reduce([], :+).sort.uniq.select{|w|
  w.match(/^[-a-zA-Z]+$/)
} - exists
# pp new_words

def encode_filename(word)
  word.gsub(/[A-Z]/) { |c| "_#{c}_" }
end

workers = parallel.times.map{
  Thread.new {
    loop do
      lk.lock
      if new_words.empty?
        lk.unlock
        break
      end
      w = encode_filename(new_words.pop())
      lk.unlock
      `mkdir -p dict/en/ja/#{w}`
      `touch dict/en/ja/#{w}/.keep`
      puts "touched #{w}"
    end
  }
}
workers.each{|w| w.join }
