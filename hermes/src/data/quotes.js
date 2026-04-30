const QUOTES = [
  { quote: "The news is the first rough draft of history.", author: "Philip L. Graham" },
  { quote: "Journalism is printing what someone else does not want printed.", author: "George Orwell" },
  { quote: "The quickest way to become a trusted source is to be accurate first.", author: "Unknown" },
  { quote: "Information is only valuable when it can be scanned, trusted, and acted on.", author: "Hermes" },
  { quote: "A good summary does not replace the story. It points to it.", author: "Unknown" },
  { quote: "Clarity beats volume when everything is competing for attention.", author: "Unknown" },
  { quote: "The best feed is the one that helps you decide what matters next.", author: "Unknown" },
];

function getDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getQuoteOfTheDay(date = new Date()) {
  const dateKey = getDateKey(date);
  const index = hashString(dateKey) % QUOTES.length;

  return QUOTES[index];
}
