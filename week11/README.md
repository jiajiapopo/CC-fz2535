# The Color of New York Today

A watercolor painted from New York's hourly temperature. Every day makes a different painting. I used Open-Meteo forecast API for my data source.

Temperature is usually a number. I want people to get a sense of it at a glance, through warm and cool colors, before reading anything. You can feel the day first. The exact numbers are in the caption at the bottom if you want them.
Each cloud of color is one hour. The day runs from left to right, from 00:00 to 23:00, and warmer hours sit higher and spread into bigger clouds, so the painting follows the day's temperature curve. The overall color comes from the day's average temperature, and colder is bluer: around -10°C it is cyan-blue, 5°C blue, 12°C violet, 20°C pink, and 32°C or more orange. Within the day, cooler hours lean toward blue and warmer hours lean toward pink or orange, and a day with a big temperature swing shows more colors than a day with a small one. The blank space on the right is the hours that have not happened yet, so today's painting is finished at midnight. The small white sparkles are texture only and are not data.

## How to use it

- Open the page. Today's painting spreads hour by hour.
- `←` `→` look at the past 7 days.
- `space` or click to paint the day again.
- Move the mouse over the painting to light up the sparkles.
