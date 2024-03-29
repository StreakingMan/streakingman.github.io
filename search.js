---
layout: none
---
export const SEARCH = [
  {% for post in site.posts %}
    {
      title: `{{ post.title | escape }}`,
      categories: `{{ post.categories }}`,
      tags: `{{ post.tags | join: ', ' }}`,
      url: `{{ site.baseurl }}{{ post.url }}`,
      date: `{{ post.date }}`,
      content: `{{ post.content | strip_html | strip_newlines }}`
    } {% unless forloop.last %},{% endunless %}
  {% endfor %}
  ,
  {% for page in site.pages %}
    {
      {% if page.title != nil %}
        title: `{{ page.title | escape }}`,
        categories: `{{ page.categories }}`,
        tags: `{{ page.tags | join: ', ' }}`,
        url: `{{ site.baseurl }}{{ page.url }}`,
        date: `{{ page.date }}`,
        content: `{{ page.content | strip_html | strip_newlines }}`
      {% endif %}
    } {% unless forloop.last %},{% endunless %}
  {% endfor %}
]
