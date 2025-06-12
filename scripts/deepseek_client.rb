require 'faraday'
require 'json'

class DeepseekClient
  def initialize(key)
    @key = key
    @conn = Faraday.new(url: "https://api.deepseek.com",
                        headers: {
                          'Content-Type' => 'application/json',
                          'accept' => 'application/json',
                          'Authorization' => "Bearer #{@key}"
                        })
    @conn.options.timeout = 3000
  end

  def prompt(query)
    result = request(query)
    result["choices"][0]["message"]["content"] =~ /(\{.*\})/m
    json = $1
    JSON.parse(json)

  rescue => e
    print("failed to parse #{e}: #{result}")
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

  def request(query)
    contents = [
      {
        role: "system",
        content: "Output Japanese translated word description for dictionary. Please fill JSON fields as many as posssible. You MUST ALWAYS fill the pronounciation field with syllables. Also you MUST KEEP case sensitively for the specified word, handle the word rigorously."
      }
    ] +
               sample_inputs(3) + [
      role: "user",
      content: query
    ]
    body = {
      messages: contents,
      model: 'deepseek-chat',
      stream: false,
    }
    target = "/chat/completions"
    resp = @conn.post("#{target}"){|req|
      req.body = body.to_json
    }
    JSON.parse(resp.body)
  end
end

if __FILE__ == $PROGRAM_NAME
  begin
    cli = DeepseekClient.new(JSON.parse(File.open("secret.json").read)["deepseek_key"])
    pp cli.prompt("quit")
  rescue => e
    pp e.backtrace
    pp e
  end
end
