require 'faraday'
require 'json'

class GemmaClient
  def initialize()
    @conn = Faraday.new(url: 'http://localhost:1234',
                        headers: {'Content-Type' => 'application/json'})
    @conn.options.timeout = 3000
  end

  def prompt(query)
    result = request(query)
    JSON.parse(extract_braces_content(result['choices'][0]["message"]["content"]))
  end

  private
  def sample_inputs(num=-1)
    `ls example`
    files = `ls example`.split("\n").grep(/json$/)
    words = files.map{|f|
      /(.*).json/ =~ f
      $1
    }

    words.map{|w|
      [
        {
          role: "user",
          content: w
        },
        {
          role:  "assistant",
          content: JSON.parse(File.open("example/#{w}.json").read).to_json
        }
      ]
    }.reduce([], :concat).flatten[0...num*2]
  end

  def extract_braces_content(str)
    left_index = str.index('{')
    right_index = str.rindex('}')
    
    if left_index && right_index && left_index < right_index
      str[left_index..right_index]
    else
      nil  # 括弧が見つからない、または順序が不正
    end
  end

  def request(query)
    contents = [
      {
        role: "system",
        content: "Output Japanese translated word description for dictionary. Please fill JSON fields as many as posssible. You MUST ALWAYS fill the pronounciation field with syllables. Also you MUST KEEP case sensitively for the specified word, handle the word rigorously."
      }
    ] + sample_inputs(2) + [
      role: "user",
      content: query
    ]
    body = {
      model: 'gemma-3-27b-it-qat',
      messages: contents,
      temperature: 0.1,
      max_tokens: -1,
      stream: false
    }
    target = "/v1/chat/completions"
    resp = @conn.post(target){|req|
      req.body = body.to_json
    }
    puts(resp.body)
    JSON.parse(resp.body)
  end
end

if __FILE__ == $PROGRAM_NAME
  cli = GemmaClient.new()
  pp cli.prompt("uprest")
end
