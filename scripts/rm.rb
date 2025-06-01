keep = `git ls-files`.split("\n").map{|w|
  Regexp.new("^(.+?)/") =~ w
  $1
}.uniq.reject{|t| t.nil?}


t = `ls */`.split("\n").map{|w|
  Regexp.new("^(.+)/") =~ w
  $1
}.uniq.reject{|t| t.nil?} - (["example", "templates", "dict", "docs"] + keep)
pp t


t.map{|m| `rm -rf #{m}`}
