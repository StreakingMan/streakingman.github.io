module Jekyll
  module CharFilter
    def remove_fk_chars(input)
      input.gsub! '\"',''
      input.gsub! '\\',''
      input.gsub! '\/',''
      input.gsub! '\b',''
      input.gsub! '\f',''
      input.gsub! '\n',''
      input.gsub! '\r',''
      input.gsub! '\t',''
      input.gsub! '\u',''
    end
  end
end

Liquid::Template.register_filter(Jekyll::CharFilter)
