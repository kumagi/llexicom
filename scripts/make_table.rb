require 'json'

index = Dir.glob("*", base: "docs").map{|m|
  /(.+).json.lz/ =~ m
  $1
}.reject{|n| n.nil? }
pp index

File.open("scripts/table.ts", "w").write("exports.table = #{index.to_json};")
