'use strict';

const BASE_RAW = [
  ['Sporcular', 'Michael Jordan, LeBron James, Kobe Bryant, Stephen Curry, Cristiano Ronaldo, Lionel Messi, Rafael Nadal, Novak Djokovic, Serena Williams, Lewis Hamilton, Max Verstappen, Usain Bolt, Muhammed Ali, Mike Tyson, Tiger Woods, Simone Biles'],
  ['Futbolcular', 'Zinedine Zidane, Ronaldinho, Ronaldo Nazário, David Beckham, Thierry Henry, Neymar, Kylian Mbappé, Erling Haaland, Luka Modrić, Kevin De Bruyne, Mohamed Salah, Andrés Iniesta, Xavi, Carles Puyol, Gianluigi Buffon, Iker Casillas, Manuel Neuer, Zlatan Ibrahimović, Wayne Rooney, Didier Drogba'],
  ['Şarkıcılar', 'Michael Jackson, Elvis Presley, Madonna, Freddie Mercury, Beyonce, Taylor Swift, Rihanna, Eminem, Drake, Billie Eilish, Ariana Grande, Lady Gaga, Bruno Mars, Adele, Ed Sheeran, Bob Marley, Frank Sinatra, Whitney Houston, David Bowie, Kurt Cobain'],
  ['Oyuncular', 'Tom Hanks, Robert De Niro, Al Pacino, Morgan Freeman, Brad Pitt, Johnny Depp, Denzel Washington, Will Smith, Hugh Jackman, Ryan Reynolds, Dwayne Johnson, Scarlett Johansson, Jennifer Lawrence, Natalie Portman, Anne Hathaway, Margot Robbie, Keanu Reeves, Christian Bale, Anthony Hopkins, Jack Nicholson'],
  ['Tarihî Kişiler', 'Albert Einstein, Isaac Newton, Nikola Tesla, Marie Curie, Charles Darwin, Galileo Galilei, Leonardo da Vinci, Michelangelo, William Shakespeare, Wolfgang Amadeus Mozart, Ludwig van Beethoven, Cleopatra, Julius Caesar, Napoleon, Mahatma Gandhi, Nelson Mandela, Abraham Lincoln, George Washington, Martin Luther King Jr., Socrates, Plato, Aristotle, Confucius, Genghis Khan, Alexander the Great, Pythagoras, Archimedes'],
  ['Yapılar ve Yerler', 'Eiffel Tower, Colosseum, Taj Mahal, Statue of Liberty, Great Wall of China, Machu Picchu, Petra, Stonehenge, Big Ben, Louvre Museum, Sydney Opera House, Burj Khalifa, Empire State Building, Golden Gate Bridge, Leaning Tower of Pisa, Christ the Redeemer, Kremlin, Buckingham Palace, Notre-Dame de Paris, Santorini, Grand Canyon, Niagara Falls, Mount Fuji, Sahara, Amazon rainforest'],
  ['Hayvanlar', 'Lion, Tiger, Elephant, Giraffe, Zebra, Kangaroo, Koala, Giant panda, Wolf, Fox, Bear, Polar bear, Gorilla, Chimpanzee, Dolphin, Whale, Shark, Octopus, Penguin, Bald eagle, Owl, Flamingo, Peacock, Crocodile, Alligator, Komodo dragon, Chameleon, Sea turtle, Seahorse, Jellyfish, Starfish, Butterfly, Bee, Ant, Scorpion, Tarantula, Camel, Llama, Alpaca, Reindeer, Moose, Hedgehog, Squirrel, Bat, Cheetah, Leopard, Jaguar, Hippopotamus, Rhinoceros'],
  ['Yiyecek ve İçecekler', 'Pizza, Hamburger, Sushi, Ramen, Croissant, Baguette, Taco, Burrito, Paella, Gelato, Tiramisu, Cheesecake, Macaron, Pretzel, Waffle, Pancake, Donut, Chocolate, Ice cream, Coffee, Espresso, Tea, Matcha, Wine, Beer, Champagne, Cheese, Butter, Honey, Olive oil, Avocado, Pineapple, Strawberry, Watermelon, Banana, Coconut, Mango, Lemon, Apple, Orange, Peach, Cherry, Grape, Tomato, Potato, Carrot, Broccoli, Corn, Mushroom, Garlic'],
  ['Markalar ve Logolar', 'Apple, Google, Microsoft, Amazon, Netflix, YouTube, Spotify, Instagram, Facebook, X Corp., TikTok, WhatsApp, Discord, Twitch, PlayStation, Xbox, Nintendo, Nike, Adidas, Puma, Lacoste, Gucci, Louis Vuitton, Chanel, Prada, Rolex, Ferrari, Porsche, Lamborghini, BMW, Mercedes-Benz, Toyota, Ford, Tesla, Coca-Cola, Pepsi, Red Bull, Starbucks, McDonald’s, KFC, IKEA, LEGO, Canon, Nikon, Sony, Samsung, Intel, Nvidia, Visa, Mastercard'],
  ['Kurgu Karakterler', 'Spider-Man, Batman, Superman, Wonder Woman, Iron Man, Captain America, Thor, Hulk, Black Widow, Deadpool, Wolverine, Joker, Darth Vader, Luke Skywalker, Yoda, Harry Potter, Hermione Granger, Ron Weasley, Gandalf, Frodo Baggins, Sherlock Holmes, James Bond, Indiana Jones, Mario, Luigi, Pikachu, Sonic the Hedgehog, Mickey Mouse, Bugs Bunny, SpongeBob SquarePants, Homer Simpson, Bart Simpson, Shrek, Elsa, Simba, Woody, Buzz Lightyear, Winnie-the-Pooh, Tom and Jerry, Scooby-Doo'],
  ['Eşyalar ve Nesneler', 'Hammer, Screwdriver, Wrench, Saw, Axe, Scissors, Knife, Spoon, Fork, Chopsticks, Kettle, Teapot, Toaster, Blender, Microwave, Refrigerator, Washing machine, Vacuum cleaner, Iron, Hair dryer, Comb, Toothbrush, Mirror, Clock, Watch, Hourglass, Compass, Telescope, Microscope, Binoculars, Camera, Flashlight, Lamp, Candle, Lantern, Umbrella, Key, Lock, Padlock, Chain, Anchor, Bell, Whistle, Drum, Guitar, Violin, Piano, Trumpet, Saxophone, Flute'],
];

const EXTRA_RAW = [
  ['Futbolcular', 'Volkan Demirel, Sergen Yalçın, Edin Džeko=Edin Džeko|Edin Dzeko|Dzeko, Mauro Icardi=Mauro Icardi|Icardi, Alex (footballer, born 1977)=Alex de Souza|Alex, Fernando Muslera=Fernando Muslera|Muslera, Gökhan Gönül, Şenol Güneş, Fatih Terim, Kerem Aktürkoğlu, Barış Alper Yılmaz, Orkun Kökçü, Kenan Yıldız, Ferdi Kadıoğlu, Semih Kılıçsoy'],
  ['Sporcular', 'Eda Erdem, Mete Gazoz, Alperen Şengün, Melissa Vargas, Busenaz Sürmeneli, Yusuf Dikeç'],
  ['Şarkıcılar', 'Duman (band)=Duman, Manga (band)=maNga|Manga, Athena (band)=Athena, Mor ve Ötesi, Edis (singer)=Edis, Zeynep Bastık, Simge (singer)=Simge, İrem Derici, Sıla (singer)=Sıla, Şebnem Ferah'],
  ['Oyuncular', 'Meryl Streep, Cillian Murphy, Emma Stone, Timothée Chalamet=Timothée Chalamet|Timothee Chalamet|Chalamet, Zendaya, Pedro Pascal'],
  ['Tarihî Kişiler', 'Hüseyin Rahmi Gürpınar'],
  ['Yapılar ve Yerler', 'Acropolis of Athens=Atina Akropolisi|Akropolis, Parthenon=Partenon|Parthenon, Neuschwanstein Castle=Neuschwanstein Şatosu|Neuschwanstein, Angkor Wat, Chichen Itza, Alhambra=Elhamra Sarayı|Alhambra|Elhamra, Brandenburg Gate=Brandenburg Kapısı|Brandenburger Tor, Trevi Fountain=Trevi Çeşmesi|Aşk Çeşmesi, Mount Rushmore=Rushmore Dağı|Mount Rushmore, Victoria Falls=Victoria Şelalesi|Victoria Falls, Mount Everest=Everest Dağı|Everest, Bodrum Castle=Bodrum Kalesi, Mount Nemrut=Nemrut Dağı|Nemrut, Göbekli Tepe=Göbeklitepe|Göbekli Tepe'],
  ['Hayvanlar', 'Capybara=Kapibara, Platypus=Ornitorenk, Narwhal=Deniz gergedanı|Narval, Snowy owl=Kar baykuşu, Kiwi (bird)=Kivi kuşu|Kivi, Walrus=Mors'],
];

const ALIAS_OVERRIDES = {
  'Napoleon': ['Napolyon', 'Napoleon'],
  'Cleopatra': ['Kleopatra', 'Cleopatra'],
  'Pythagoras': ['Pisagor', 'Pythagoras'],
  'Archimedes': ['Arşimet', 'Archimedes'],
};

const items = [];
for (const [c, list] of [...BASE_RAW, ...EXTRA_RAW]) {
  for (const part of list.split(',')) {
    const s = part.trim();
    if (!s) continue;
    const [rawTitle, rawAns] = s.split('=');
    const title = rawTitle.trim();
    const name = rawAns ? rawAns.split('|')[0].trim() : title;
    const ans = ALIAS_OVERRIDES[title]
      ? ALIAS_OVERRIDES[title]
      : (rawAns ? rawAns.split('|').map(x => x.trim()).filter(Boolean) : [title]);
    items.push({ id: 'px:' + title, title, name, ans, c });
  }
}

module.exports = items;
