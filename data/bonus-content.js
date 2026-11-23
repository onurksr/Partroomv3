'use strict';

let _seq = 0;
const uid = p => p + '_b' + (++_seq);
const tf = (c, t, v, x) => ({ id: uid('tf'), c, t, v, x });
const cl = (c, t, v, u, x) => ({ id: uid('cl'), c, t, v, u, x });
const qz = (c, t, o, v, x) => ({ id: uid('qz'), c, t, o, v, x });
const lr = (c, o, v, x) => ({ id: uid('lr'), c, t: 'Hangisi yanlıştır?', o, v, x });
const wy = (a, b) => ({ id: uid('wy'), c: 'Günlük', t: 'Hangisini seçerdin?', o: [a, b], v: null, x: 'Çoğunluğun seçtiği seçenek puan kazandırır!' });
const ml = t => ({ id: uid('ml'), c: 'Grup', t: 'Odada kim daha olası: ' + t + '?', o: [], v: null, x: 'Arkadaşlarını oyla!' });
const em = (c, t, a, x) => ({ id: uid('em'), c, t, a, x });
const im = (c, common, imposter) => ({ id: uid('im'), c, common, imposter });

module.exports = {
  TF_BANK: [
    tf('Doğa', 'Yunuslar memelidir.', true, 'Yunuslar süt verir ve akciğerleriyle nefes alır.'),
    tf('Coğrafya', 'Türkiye’nin başkenti İstanbul’dur.', false, 'Başkent, 1923’ten beri Ankara’dır.'),
    tf('Fizik', 'Elmas, bilinen en sert doğal maddedir.', true, 'Mohs sertlik ölçeğinde elmas en üsttedir.'),
    tf('Tarih', 'Osmanlı Devleti geleneksel kabule göre 1299’da kuruldu.', true, '1299, kuruluş için en yaygın kabul gören tarihtir.'),
    tf('Biyoloji', 'Kediler tatlı tadını alamaz.', true, 'Kedilerde tatlı tat reseptörünün geni çalışmaz.'),
    tf('Uzay', 'Güneş Sistemi’nin en büyük gezegeni Jüpiter’dir.', true, 'Jüpiter, diğer gezegenlerin toplam kütlesinden daha ağırdır.'),
    tf('Fizik', 'Su donarken genleşir.', true, 'Buz, sıvı sudan daha az yoğundur; bu yüzden yüzer.'),
    tf('Tarih', 'Berlin Duvarı’nın yıkılışı 1989’da başladı.', true, 'Duvar 9 Kasım 1989’da açıldı.'),
    tf('Genel Kültür', 'Mona Lisa’yı Michelangelo yaptı.', false, 'Mona Lisa, Leonardo da Vinci’nin eseridir.'),
    tf('Coğrafya', 'Sahra, dünyanın en büyük sıcak çölüdür.', true, 'En büyük çöl Antarktika’dır; en büyük sıcak çöl ise Sahra’dır.'),
    tf('Doğa', 'Ornitorenkler, su altında avlarını bulmak için elektrik algılama duyusunu kullanır.', true, 'Erkek ornitorenkler aynı zamanda arka ayaklarında zehirli mahmuz taşır.'),
    tf('Doğa', 'Kapibaralar, Şili dışındaki tüm Güney Amerika ülkelerinde yaşar.', true, 'Kapibara dünyanın yaşayan en büyük kemirgenidir.'),
    tf('Doğa', 'Deniz gergedanının (narval) uzun sarmal boynuzu aslında sol üst köpek dişidir.', true, 'Bu sarmal diş üst çeneden uzayarak çıkar.'),
    tf('Doğa', 'Kivi kuşları, çoğu kuştan farklı olarak iki işlevsel yumurtalığa sahiptir.', true, 'Çoğu kuşta yalnızca sol yumurtalık işlevseldir.'),
    tf('Tarih', 'Kamboçya’daki Angkor Wat tapınak kompleksi ülke bayrağında yer alır.', true, 'Angkor Wat ayrıca tapınakların çoğundan farklı olarak batıya bakar.'),
    tf('Tarih', 'Gize’deki Büyük Piramit, Antik Dünyanın Yedi Harikası içinde hâlâ ayakta kalan tek yapıdır.', true, 'Yaklaşık MÖ 2600 yılında Firavun Khufu için inşa edilmiştir.'),
    tf('Coğrafya', 'Dünya merkezine en uzak nokta Everest Dağı’nın zirvesidir.', false, 'Dünya ekvatorda şişkin olduğu için Ekvador’daki Chimborazo zirvesi merkeze daha uzaktır.'),
    tf('Sinema', 'Parasite filmi, En İyi Film Oscar’ını kazanan ilk İngilizce olmayan yapımdır.', true, '2019 yapımı film dört Akademi Ödülü kazanmıştır.'),
    tf('Mimarlık', 'Barselona’daki Sagrada Família’nın inşaatı tamamlanmamış olmasına rağmen bölümleri UNESCO listesindedir.', true, 'Antoni Gaudí projeyi 1884’te başmimar olarak devralmıştır.'),
    tf('Tarih', 'Bodrum Kalesi’nin inşasına 1402 yılından itibaren başlanmıştır.', true, 'Bodrum Kalesi güneybatı Türkiye’de yer alan tarihî bir kaledir.'),
    tf('Coğrafya', 'Victoria Şelalesi, Zambiya ve Zimbabve sınırında yer alır.', true, 'Zambiya tarafındaki milli park Mosi-oa-Tunya adını taşır.'),
    tf('Mimarlık', 'Roma’daki Trevi Çeşmesi’nin adı Latince "üç yolun kesişimi" anlamına gelen trivium kelimesinden gelir.', true, 'Çeşme 1732–1762 yılları arasında inşa edilmiştir.'),
    tf('Doğa', 'Erkek ornitorenkler zehirli değildir.', false, 'Erkek ornitorenklerin arka ayaklarında şiddetli ağrı veren zehirli mahmuz bulunur.'),
    tf('Tarih', 'İspanya’nın Granada kentindeki Elhamra Sarayı yalnızca Rönesans döneminden kalmadır.', false, 'Elhamra, Orta Çağ İslam mimarisinin en ünlü saraylarından biridir.'),
    tf('Sinema', 'Yeşilçam klasiği Tosun Paşa’da Şaban karakteri sahte Tosun Paşa kılığına girer.', true, '1976 yapımı film Tellioğulları ile Seferoğulları arasındaki mücadeleyi anlatır.'),
    tf('Spor', 'Okçu Mete Gazoz, 2020 Yaz Olimpiyatları’nda bireyselde altın madalya kazanmıştır.', true, 'Mete Gazoz Türkiye adına bireysel olimpiyat altını almıştır.'),
    tf('Spor', 'Alperen Şengün, NBA takımlarından Houston Rockets forması giymektedir.', true, 'Milli basketbolcu NBA’de Houston Rockets kadrosundadır.'),
    tf('Tarih', 'Göbeklitepe yerleşimi yaklaşık MÖ 9500 dönemine kadar uzanır.', true, 'Şanlıurfa’daki alan Neolitik döneme aittir.'),
    tf('Sinema', 'Oppenheimer filmi 2023’te vizyona girip 7 Akademi Ödülü kazanmıştır.', true, 'Cillian Murphy ve Robert Downey Jr. bu filmle Oscar almıştır.'),
    tf('Doğa', 'Morsların doğadaki başlıca avcıları yalnızca orka ve kutup ayısıdır.', true, 'Kalın derileri ve dişleri sayesinde başka doğal düşmanları yoktur.'),
    tf('Uzay', 'Satürn’ün halkaları ağırlıklı olarak buz ve kaya parçalarından oluşur.', true, 'Satürn halkaları büyük ölçüde buz kristalleri ve kaya kalıntılarından meydana gelir.'),
    tf('Biyoloji', 'Ahtapotların üç kalbi vardır.', true, 'İki kalp solungaçlara kan pompalar, üçüncüsü vücuda dağıtır.'),
    tf('Coğrafya', 'Nil Nehri kuzeye doğru akar.', true, 'Nil güneyden kuzeye akarak Akdeniz’e dökülür.'),
    tf('Uzay', 'Venüs, kendi ekseni etrafında çoğu gezegenin tersi yönde döner.', true, 'Venüs retrograd (ters) dönüş hareketi yapar.'),
    tf('Müzik', 'Standart bir gitarda genellikle altı tel bulunur.', true, 'Klasik, akustik ve elektro gitarların çoğu 6 tellidir.'),
  ],
  CLOSEST_BANK: [
    cl('Dünya', 'Türkiye’de kaç il vardır?', 81, '', 'Türkiye’de 81 il vardır.'),
    cl('Dünya', 'Satranç tahtasında toplam kaç kare vardır?', 64, '', '8 × 8 = 64 kare.'),
    cl('Uzay', 'Güneş ışığı Dünya’ya yaklaşık kaç dakikada ulaşır?', 8, 'dk', 'Yaklaşık 8 dakika 20 saniye sürer.'),
    cl('Tarih', 'Birinci Dünya Savaşı hangi yılda başladı?', 1914, '', 'Savaş, Temmuz 1914’te başladı.'),
    cl('Biyoloji', 'Yetişkin bir insanda kaç kemik bulunur?', 206, '', 'Yetişkinlerde 206 kemik vardır.'),
    cl('Coğrafya', 'Everest Dağı’nın deniz seviyesinden yüksekliği kaç metredir?', 8848, 'm', 'Everest’in yüksekliği 8.848 metre olarak ölçülür.'),
    cl('Mimarlık', 'Gize’deki Büyük Piramit yaklaşık kaç yaşındadır?', 4600, 'yıl', 'Arkeolojik ve radyokarbon verileri yaklaşık 4.600 yıl öncesini gösterir.'),
    cl('Mimarlık', 'Almanya’daki Neuschwanstein Şatosu’nun yüksekliği kaç metredir?', 65, 'm', 'Guinness’e göre 65 metre ile dünyanın en yüksek şatolarındandır.'),
    cl('Tarih', 'Bodrum Kalesi’nin yapımına hangi yılda başlanmıştır?', 1402, '', 'Bodrum Kalesi 1402’den itibaren inşa edilmiştir.'),
    cl('Mimarlık', 'Berlin’deki Brandenburg Kapısı’nın yapımına hangi yılda başlandı?', 1788, '', '1788–1791 yılları arasında inşa edilmiştir.'),
    cl('Mimarlık', 'Roma’daki Trevi Çeşmesi hangi yılda tamamlandı?', 1762, '', '1732’de başlayan inşaat 1762’de tamamlanmıştır.'),
    cl('Mimarlık', 'Antoni Gaudí, Sagrada Família’nın başmimarlığını hangi yılda üstlendi?', 1884, '', 'İnşaat 1883’te başlamış, Gaudí 1884’te başmimar olmuştur.'),
    cl('Sinema', 'Yüzüklerin Efendisi: Kralın Dönüşü toplam kaç Oscar kazanmıştır?', 11, 'Oscar', '2003 yapımı film aday olduğu 11 dalın tamamını kazanmıştır.'),
    cl('Sinema', 'Oppenheimer filmi toplam kaç Akademi Ödülü (Oscar) kazanmıştır?', 7, 'Oscar', 'En İyi Film ve En İyi Yönetmen dahil 7 Oscar almıştır.'),
    cl('Doğa', 'Kapibaralar su altında nefeslerini en fazla kaç dakika tutabilir?', 5, 'dk', 'Yarı sucul kapibaralar su altında 5 dakikaya kadar kalabilir.'),
    cl('Doğa', 'Erkek morsların boyun ve omuz derisi kaç santimetre kalınlığa ulaşabilir?', 10, 'cm', 'Deri 10 cm, altındaki yağ tabakası ise 15 cm’ye ulaşabilir.'),
    cl('Tarih', 'Atina Akropolisi’ni çevreleyen antik surların uzunluğu yaklaşık kaç metredir?', 760, 'm', 'Antik surlar yaklaşık 760 metre uzunluğundaydı.'),
    cl('Sinema', 'Şener Şen ve Kemal Sunal’lı Tosun Paşa filmi hangi yılda çekildi?', 1976, '', '1976 yapımı Yeşilçam klasiğidir.'),
    cl('Sinema', 'Eşkıya filmi hangi yılda vizyona girdi?', 1996, '', '1996 yapımı Türk sineması klasiğidir.'),
    cl('Müzik', 'Tarkan’ın ikinci stüdyo albümü Aacayipsin hangi yılda çıktı?', 1994, '', '17 Mayıs 1994’te yayımlanmıştır.'),
    cl('Dünya', 'Bir haftada toplam kaç gün vardır?', 7, 'gün', '1 hafta = 7 gün.'),
    cl('Dünya', 'Bir yılda toplam kaç ay vardır?', 12, 'ay', '1 yıl = 12 ay.'),
    cl('Matematik', 'Bir karenin kaç kenarı vardır?', 4, '', 'Kare dört kenarlı çokgendir.'),
    cl('Matematik', 'Bir üçgenin kaç köşesi vardır?', 3, '', 'Üçgen üç kenar ve üç köşeden oluşur.'),
    cl('Uzay', 'Güneş Sistemi’nde Güneş’e en yakın gezegenin ardından üçüncü gezegenin yörünge sırası kaçtır?', 3, '', 'Dünya, Güneş’ten itibaren 3. gezegendir.'),
    cl('Coğrafya', 'Türkiye’nin en yüksek dağı olarak bilinen Ağrı Dağı’nın zirvesi yaklaşık kaç metredir?', 5137, 'm', 'Büyük Ağrı zirvesi yaklaşık 5.137 metre yüksekliğindedir.'),
    cl('Dünya', 'Bir saatte toplam kaç dakika vardır?', 60, 'dk', '1 saat = 60 dakika.'),
    cl('Spor', 'Basketbolda çizgi gerisinden atılan bir üçlük kaç sayı değerindedir?', 3, 'sayı', 'Üçlük çizgisi gerisinden yapılan isabetli atış 3 sayıdır.'),
    cl('Spor', 'Futbolda penaltı noktası ile kale çizgisi arasındaki mesafe kaç metredir?', 11, 'm', 'Standart penaltı noktası kaleye 11 metre uzaklıktadır.'),
    cl('Müzik', 'Bir standart gitarda tel sayısı kaçtır?', 6, 'tel', 'Standart gitarlarda 6 tel bulunur.'),
    cl('Genel Kültür', 'Bir yüzyıl kaç yıldan oluşur?', 100, 'yıl', '1 yüzyıl = 100 yıl.'),
    cl('Bilim', 'Periyodik tabloda karbonun atom numarası kaçtır?', 6, '', 'Karbon elementi periyodik tabloda 6. sıradadır.'),
  ],
  QUIZ_BANK: [
    qz('Uzay', 'Dünya’nın doğal uydusu hangisidir?', ['Mars', 'Ay', 'Venüs', 'Titan'], 1, 'Ay, Dünya’nın tek doğal uydusudur.'),
    qz('Coğrafya', 'Japonya’nın başkenti neresidir?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2, 'Osaka ve Kyoto büyük şehirlerdir ama başkent Tokyo’dur.'),
    qz('Uzay', 'Hangi gezegen “Kızıl Gezegen” olarak bilinir?', ['Mars', 'Jüpiter', 'Satürn', 'Merkür'], 0, 'Yüzeyindeki demir oksit ona kırmızımsı rengini verir.'),
    qz('Edebiyat', 'Sefiller romanının yazarı kimdir?', ['Victor Hugo', 'Charles Dickens', 'Honoré de Balzac', 'Émile Zola'], 0, 'Victor Hugo, romanı 1862’de yayımladı.'),
    qz('Sanat', 'Çığlık tablosunun ressamı kimdir?', ['Edvard Munch', 'Vincent van Gogh', 'Claude Monet', 'Salvador Dalí'], 0, 'Edvard Munch, Çığlık’ın ilk versiyonunu 1893’te yaptı.'),
    qz('Müzik', 'Standart bir piyanoda kaç tuş bulunur?', ['66', '76', '88', '98'], 2, '88 tuş: 52 beyaz ve 36 siyah.'),
    qz('Bilim', 'Periyodik tabloda “Fe” simgesi hangi elemente aittir?', ['Flor', 'Fermiyum', 'Demir', 'Fosfor'], 2, 'Fe, Latince “ferrum” (demir) sözcüğünden gelir.'),
    qz('Teknoloji', 'İlk iPhone hangi yıl tanıtıldı?', ['2005', '2007', '2009', '2010'], 1, 'Steve Jobs, iPhone’u Ocak 2007’de tanıttı.'),
    qz('Mimarlık', 'Atina’daki Partenon tapınağının mimarları kimlerdir?', ['İktinos ve Kallikrates', 'Mimar Sinan ve Davud Ağa', 'Antoni Gaudí ve Lluís Domènech', 'Bernini ve Salvi'], 0, 'Tapınak MÖ 447’de İktinos ile Kallikrates tasarımına göre yapılmaya başlandı.'),
    qz('Mimarlık', 'Brandenburg Kapısı’nın tasarımında hangi antik yapıdan esinlenilmiştir?', ['Atina Akropolisi Propylaea', 'Roma Kolezyumu', 'Gize Sfenksi', 'Elhamra Sarayı'], 0, 'Carl Gotthard Langhans, Atina Akropolisi’nin anıtsal girişini örnek almıştır.'),
    qz('Mimarlık', 'Elhamra Sarayı hangi şehirde yer alır?', ['Sevilla', 'Granada', 'Madrid', 'Toledo'], 1, 'Elhamra, İspanya’nın Granada kentinde bulunur.'),
    qz('Tarih', 'Chichen Itza antik kenti hangi uygarlık tarafından inşa edilmiştir?', ['İnka', 'Maya', 'Aztek', 'Sümer'], 1, 'Meksika’nın Yucatán yarımadasındaki Maya kentidir.'),
    qz('Coğrafya', 'Deniz altındaki tabanından zirvesine ölçüldüğünde Dünya’nın en yüksek dağı hangisidir?', ['Everest', 'Mauna Kea', 'Ağrı Dağı', 'Chimborazo'], 1, 'Hawaii’deki Mauna Kea, okyanus tabanından 10.200 metreyi aşar.'),
    qz('Doğa', 'Dünyanın yaşayan en büyük kemirgen türü hangisidir?', ['Kunduz', 'Kapibara', 'Kirpi', 'Çinçilla'], 1, 'Kapibaralar Güney Amerika’nın en büyük kemirgenidir.'),
    qz('Doğa', 'Hangi memeli türü elektrik algılama duyusuna ek olarak erkeklerinde zehirli mahmuz taşır?', ['Ornitorenk', 'Kivi', 'Kapibara', 'Mors'], 0, 'Ornitorenk tek delikliler takımından zehirli bir memelidir.'),
    qz('Sinema', '2019 yapımı Parasite filmi hangi önemli Akademi Ödülü rekorunu kırdı?', ['En fazla görsel efekt ödülü', 'İngilizce olmayan ilk En İyi Film', 'İlk animasyon En İyi Film', 'En kısa sürede çekilen film'], 1, 'Bong Joon-ho’nun filmi İngilizce dışında bir dilde En İyi Film Oscar’ını alan ilk yapımdır.'),
    qz('Sinema', 'Whiplash ve La La Land filmlerinin yönetmeni kimdir?', ['Christopher Nolan', 'Damien Chazelle', 'George Miller', 'Denis Villeneuve'], 1, 'Damien Chazelle, La La Land ile En İyi Yönetmen Oscar’ını almıştır.'),
    qz('Sinema', 'Mad Max: Fury Road filminin yönetmeni kimdir?', ['George Miller', 'Ridley Scott', 'James Cameron', 'Quentin Tarantino'], 0, 'George Miller’ın 2015 yapımı filmi 6 Oscar kazanmıştır.'),
    qz('Sinema', 'Masumiyet (1997) filminin yönetmeni kimdir?', ['Zeki Demirkubuz', 'Nuri Bilge Ceylan', 'Çağan Irmak', 'Yavuz Turgul'], 0, 'Haluk Bilginer ve Derya Alabora’nın oynadığı filmi Zeki Demirkubuz yönetmiştir.'),
    qz('Sinema', 'Süt Kardeşler filminde Şener Şen hangi karakteri canlandırmıştır?', ['Badi Ekrem', 'Hüsamettin', 'Tosun Paşa', 'Vecihi'], 1, 'Süt Kardeşler’de Şener Şen sert mizaçlı Hüsamettin rolündedir.'),
    qz('Spor', 'Fenerbahçe ve A Milli Kadın Voleybol Takımı kaptanı olarak bilinen ve stadyum önüne heykeli dikilen sporcu kimdir?', ['Eda Erdem', 'Melissa Vargas', 'Neslihan Demir', 'Zehra Güneş'], 0, 'Eda Erdem 2008’den beri Fenerbahçe forması giymektedir.'),
    qz('Spor', '2024 Yaz Olimpiyatları’nda Türkiye’ye atıcılıkta madalya kazandıran ikili kimdir?', ['Yusuf Dikeç ve Şevval İlayda Tarhan', 'Mete Gazoz ve Busenaz Sürmeneli', 'Alperen Şengün ve Cedi Osman', 'Rıza Kayaalp ve Taha Akgül'], 0, 'Karma 10 m havalı tabanca takımında gümüş madalya kazanılmıştır.'),
    qz('Müzik', 'Sertab Erener’in 2003 yılında yayımlanan şarkısı hangisidir?', ['Everyway That I Can', 'Aya Benzer', 'Kırmızı', 'Çakkıdı'], 0, 'Everyway That I Can 2003 yılında yayımlanmıştır.'),
    qz('Müzik', 'Mor ve Ötesi grubunun adındaki kelime oyunu hangi ifadeye dayanır?', ['Morötesi (Ultraviyole)', 'Mor Dalga', 'Öteki Dünya', 'Mor Rüzgar'], 0, 'Grup adı "ultraviyole" anlamına gelen morötesi sözcüğünden türetilmiştir.'),
    qz('Mimarlık', 'Mount Rushmore anıtında aşağıdaki ABD başkanlarından hangisinin yüzü yer almaz?', ['George Washington', 'Abraham Lincoln', 'Thomas Jefferson', 'John F. Kennedy'], 3, 'Anıtta Washington, Jefferson, Theodore Roosevelt ve Lincoln bulunur.'),
    qz('Tarih', 'Gize Piramitleri arasındaki Büyük Sfenks hangi firavun dönemine tarihlenir?', ['Khafre (Kefren)', 'Tutankhamun', 'Ramses II', 'Kleopatra'], 0, 'Büyük Sfenks, Kral Khafre (Kefren) döneminden kalmadır.'),
    qz('Doğa', 'Yeni Zelanda’nın ulusal simgesi hâline gelmiş uçamayan kuş hangisidir?', ['Kivi', 'Flamingo', 'Kar baykuşu', 'Penguen'], 0, 'Yeni Zelandalılar uluslararası alanda "Kiwi" lakabıyla da anılır.'),
    qz('Mimarlık', 'Sagrada Família’nın tamamlanmış olan ilk ana cephesi hangisidir?', ['Doğuş (Nativity) Cephesi', 'Çile (Passion) Cephesi', 'Zafer (Glory) Cephesi', 'Kuzey Kulesi'], 0, 'Doğuş cephesi 1893–1936 arasında inşa edilmiştir.'),
  ],
  LIAR_BANK: [
    lr('Doğa', ['Ornitorenk elektro-algılama ile avlanır', 'Kapibaralar dünyanın en büyük kemirgenidir', 'Deniz gergedanının boynuzu bir kulak kemiğidir', 'Kivi kuşu uçamaz'], 2, 'Deniz gergedanının sarmal boynuzu aslında sol üst köpek dişidir.'),
    lr('Mimarlık', ['Sagrada Família Barselona’dadır', 'Elhamra Sarayı İspanya’dadır', 'Angkor Wat Kamboçya bayrağında yer alır', 'Partenon Roma’da inşa edilmiştir'], 3, 'Partenon, Yunanistan’ın Atina Akropolisi’nde yer alır.'),
    lr('Sinema', ['Oppenheimer 7 Oscar kazanmıştır', 'Parasite İngilizce olmayan ilk En İyi Film Oscar’ını almıştır', 'La La Land filmini Christopher Nolan yönetmiştir', 'Spider-Man: Into the Spider-Verse En İyi Animasyon Oscar’ını almıştır'], 2, 'La La Land’in yönetmeni Damien Chazelle’dir.'),
    lr('Türk Sineması', ['Tosun Paşa 1976 yapımıdır', 'Eşkıya 1996’da vizyona girmiştir', 'G.O.R.A. filminde Cem Yılmaz rol almıştır', 'Babam ve Oğlum 1970’li yılların Yeşilçam filmidir'], 3, 'Babam ve Oğlum 2005 yapımı bir filmdir.'),
    lr('Coğrafya', ['Everest deniz seviyesinden 8.848 m yüksektedir', 'Victoria Şelalesi Zambiya-Zimbabve sınırındadır', 'Mount Rushmore ABD’dedir', 'Chichen Itza Peru’da yer alan bir İnka kentidir'], 3, 'Chichen Itza Meksika’nın Yucatán bölgesindeki bir Maya kentidir.'),
    lr('Doğa', ['Kapibaralar su altında 5 dakika nefes tutabilir', 'Morsların başlıca doğal avcıları orka ve kutup ayısıdır', 'Kar baykuşları yalnızca tropikal yağmur ormanlarında yaşar', 'Erkek ornitorenkler zehirlidir'], 2, 'Kar baykuşları Arktik tundra bölgelerinde yaşar.'),
    lr('Müzik', ['Tarkan 1994’te Aacayipsin albümünü çıkarmıştır', 'Kenan Doğulu’nun Çakkıdı şarkısı 2006 yılındadır', 'Mustafa Sandal’ın Aya Benzer şarkısı 1998 yılındadır', 'Barış Manço, Duman grubunun solistidir'], 3, 'Duman grubunun solisti Kaan Tangöze’dir.'),
    lr('Tarih', ['Büyük Piramit Antik Dünyanın Yedi Harikası içindeki en eski yapıdır', 'Göbeklitepe Neolitik dönemden kalmadır', 'Bodrum Kalesi’ne 1402’de başlanmıştır', 'Brandenburg Kapısı İstanbul’da yer alır'], 3, 'Brandenburg Kapısı Almanya’nın Berlin kentindedir.'),
    lr('Spor', ['Mete Gazoz okçulukta olimpiyat altını kazanmıştır', 'Busenaz Sürmeneli olimpiyat şampiyonu boksördür', 'Eda Erdem milli voleybol kaptanıdır', 'Yusuf Dikeç yüzme dalında olimpiyat madalyası almıştır'], 3, 'Yusuf Dikeç atıcılık (havalı tabanca) sporcusudur.'),
    lr('Mimarlık', ['Trevi Çeşmesi Roma’dadır', 'Neuschwanstein Şatosu Almanya’dadır', 'Sagrada Família’yı Antoni Gaudí tasarlamıştır', 'Sümela Manastırı Antalya’dadır'], 3, 'Sümela Manastırı Trabzon’un Maçka ilçesindedir.'),
    lr('Sinema', ['Kibar Feyzo 1978 yapımıdır', 'Bergen filmi 2022’de vizyona girmiştir', 'Dune: Part Two filmini Denis Villeneuve yönetmiştir', 'Barbie filminin yönetmeni George Miller’dır'], 3, 'Barbie’yi Greta Gerwig yönetmiştir; George Miller ise Mad Max: Fury Road’un yönetmenidir.'),
    lr('Doğa', ['Kivi kuşu Yeni Zelanda’nın simgesidir', 'Kapibaralar Şili hariç tüm Güney Amerika ülkelerinde bulunur', 'Morsların derisi sadece 1 milimetre kalınlığındadır', 'Ornitorenkler avlarını bulmak için elektrik algılama duyusuna sahiptir'], 2, 'Erkek morsların derisi 10 cm kalınlığa kadar ulaşabilir.'),
  ],
  WYR_BANK: [
    wy('Sınırsız internet', 'Sınırsız pizza'), wy('Hiç yağmur yağmasın', 'Hiç kar yağmasın'),
    wy('Işınlanabilmek', 'Zamanı durdurabilmek'), wy('Sadece tatlı yemek', 'Sadece tuzlu yemek'),
    wy('Her şeyi bilmek', 'Her şeyi yapabilmek'), wy('Bir ay telefonsuz yaşamak', 'Bir ay müziksiz yaşamak'),
    wy('Sevdiğin dizide oynamak', 'Sevdiğin takımda oynamak'), wy('Her gün erken kalkmak', 'Her gün geç yatmak'),
    wy('Ücretsiz dünya turu', 'Hayalindeki ev'), wy('Sadece yaz mevsimi', 'Sadece kış mevsimi'),
    wy('Hayvanlarla konuşabilmek', 'Tüm dilleri konuşabilmek'), wy('Görünmez olmak', 'Uçabilmek'),
    wy('Bir yıl boyunca sadece film izlemek', 'Bir yıl boyunca sadece müzik dinlemek'),
    wy('Geçmişteki en büyük sırrı öğrenmek', '100 yıl sonrasını 1 gün görmek'),
    wy('Hiç uyumaya ihtiyaç duymamak', 'Hiç acıkmamak'), wy('Her gün başka bir ülkede uyanmak', 'Aynı şehirde sarayda yaşamak'),
    wy('Kendi restoranını açmak', 'Kendi filmini çekmek'), wy('Asla trafik yaşamamak', 'Asla sıra beklememek'),
    wy('Sadece komedi filmi izlemek', 'Sadece bilim kurgu filmi izlemek'),
    wy('En sevdiğin sanatçıyla akşam yemeği', 'En sevdiğin futbolcuyla maç yapmak'),
    wy('Deniz altında nefes alabilmek', 'Uzayda yürüyüş yapabilmek'),
    wy('Telefon pilinin hiç bitmemesi', 'İnternetinin hiç kesilmemesi'),
    wy('Eski bir kaleyi restore edip yaşamak', 'Modern bir gökdelenin en üst katında yaşamak'),
    wy('Her sabah deniz kenarında uyanmak', 'Her sabah dağ manzarasına uyanmak'),
    wy('Her gün yeni bir şehir gezmek', 'Hep sevdiğin şehirde kalmak'),
  ],
  ML_BANK: [
    ml('Yolda giderken kaybolan'), ml('Her şeyi son dakikaya bırakan'), ml('Telefonunu en çok kaybeden'),
    ml('Sürpriz parti planlayan'), ml('Filmin sonunu önceden söyleyen'), ml('Mesajlara en geç cevap veren'),
    ml('Sinemada ilk ağlayan'), ml('Her gün kahve içen'),
    ml('Şarkıyı yanlış sözlerle söyleyen'), ml('Tatile 3 bavulla giden'), ml('Gece 3’te yemek sipariş eden'),
    ml('Bir oyunda kuralları en çok tartışan'), ml('Alarmı 10 kez erteleyen'), ml('En çabuk gülen'),
    ml('Bir yarışmada ilk elenen ama en çok eğlenen'), ml('Grup fotoğrafında gözü kapalı çıkan'),
    ml('Her şeye "ben demiştim" diyen'), ml('En garip bilgileri bilen'), ml('Bütün gece dedektif gibi ipucu arayan'),
    ml('Sürekli yeni bir hobiye başlayıp yarım bırakan'), ml('Biletini evde unutup havaalanına giden'),
    ml('Çay/kahve dökme rekoru kıran'), ml('En sessiz görünüp en çok şaşırtan'),
    ml('Grup planında en son hazır olan'), ml('Grup oyununda en soğukkanlı kalan'),
  ],
  EMOJI_BANK: [
    em('Film', '🕷️👨', ['örümcek adam', 'orumcek adam', 'spiderman', 'spider man'], 'Örümcek Adam'),
    em('Film', '🚢🧊❤️', ['titanic'], 'Titanic'),
    em('Film', '🐠🔍', ['kayıp balık nemo', 'kayip balik nemo', 'balık nemo', 'nemo', 'finding nemo'], 'Kayıp Balık Nemo'),
    em('Film', '❄️👸⛄', ['karlar ülkesi', 'karlar ulkesi', 'frozen'], 'Karlar Ülkesi'),
    em('Film', '⚡👓🧹', ['harry potter'], 'Harry Potter'),
    em('Dizi', '🦑🔴🔺', ['squid game', 'kalamar oyunu'], 'Squid Game'),
    em('Film', '💣⚛️🎩', ['oppenheimer'], 'Oppenheimer'),
    em('Film', '💖👠🏠', ['barbie'], 'Barbie'),
    em('Film', '🥁🩸🏫', ['whiplash'], 'Whiplash'),
    em('Film', '🏜️🪱👁️', ['dune', 'çöl gezegeni'], 'Dune'),
    em('Film', '💃🎹🌟', ['la la land', 'aşıklar şehri'], 'La La Land'),
    em('Film', '🎸💀🌺', ['coco'], 'Coco'),
    em('Film', '🧠😢😡😊', ['inside out', 'ters yüz', 'ters yuz'], 'Ters Yüz (Inside Out)'),
    em('Film', '🚗🔥🏜️', ['mad max', 'mad max fury road'], 'Mad Max: Fury Road'),
    em('Film', '💍🌋👑', ['yüzüklerin efendisi', 'yuzuklerin efendisi', 'lord of the rings'], 'Yüzüklerin Efendisi'),
    em('Film', '👽🛸🇹🇷', ['gora', 'g.o.r.a'], 'G.O.R.A.'),
    em('Film', '🦇🃏🌃', ['the dark knight', 'dark knight', 'kara şövalye', 'batman'], 'The Dark Knight'),
    em('Film', '🏠🪳🪜', ['parasite', 'parazit'], 'Parasite'),
    em('Film', '👨‍👧‍👦😭🌾', ['babam ve oğlum', 'babam ve oglum'], 'Babam ve Oğlum'),
    em('Film', '🧹🗑️👑', ['çöpçüler kralı', 'copculer krali'], 'Çöpçüler Kralı'),
    em('Film', '🥛👬👻', ['süt kardeşler', 'sut kardesler'], 'Süt Kardeşler'),
    em('Film', '⚔️🏛️🦁', ['gladyatör', 'gladiator'], 'Gladyatör'),
    em('Film', '🕶️💊🟢', ['matrix', 'the matrix'], 'The Matrix'),
    em('Film', '🚀🌌⏳', ['interstellar', 'yıldızlararası', 'yildizlararasi'], 'Interstellar'),
  ],
  IMPOSTER_BANK: [
    im('Yiyecek', 'Mantı', 'Ravioli'), im('Yiyecek', 'Baklava', 'Künefe'),
    im('Yiyecek', 'Menemen', 'Omlet'), im('Yiyecek', 'Simit', 'Poğaça'),
    im('Mekan', 'Kütüphane', 'Kitapçı'), im('Mekan', 'Müze', 'Sanat Galerisi'),
    im('Mekan', 'Havaalanı', 'Otogar'), im('Mekan', 'Stadyum', 'Spor Salonu'),
    im('Mekan', 'Lunapark', 'Sirk'), im('Doğa', 'Şelale', 'Nehir'),
    im('Doğa', 'Yanardağ', 'Dağ'), im('Doğa', 'Ada', 'Yarımada'),
    im('Eşya', 'Gözlük', 'Lens'), im('Eşya', 'Şemsiye', 'Yağmurluk'),
    im('Eşya', 'Piyano', 'Org'), im('Eşya', 'Teleskop', 'Dürbün'),
    im('Meslek', 'Pilot', 'Kaptan'), im('Meslek', 'Dedektif', 'Polis'),
    im('Kavram', 'Tatil', 'Bayram'), im('Kavram', 'Fısıltı', 'Yankı'),
  ],
};

const W = s => s.trim().split(/\s+/);
module.exports.CODENAMES_WORDS_EXTRA = W(`
  akvaryum albüm anıt antika asansör astronot atlas ayakkabı badem balkon
  baraj bavul bayram bekçi belge bere biberon bisiklet boşluk börek
  bülten ceylan cımbız çadır çakıl çamaşır çardak çekirge çeşme çınar
  çizgi çoban çorap daktilo damla define defne derece dergi denizfeneri
  devekuşu diken dinazor dirsek dize dolunay domuz dosya dövme düğüm
  dükkan dürbün eczane ejderha ekvator elmas elyazması emniyet enerji erik
  etek eylül fabrika fanus fatura fener fıçı fındık fırça fıstık
  filiz fişek flüt fok fotoğrafçı galaksi garson gazoz gecekondu gelincik
  gerdanlık gezgin gitar gökkuşağı göktaşı gözlükçü güvercin halat hamak
  hançer harçlık hasır heybe hırka hokka horoz ıhlamur ıspanak ızgara
  ibrik iksir ilmik imece inci ipotek iplik iskelet istasyon izci
  jaguar jilet kabin kabuk kadeh kadife kaftan kalemlik kalkan kalorifer
  kamyonet kanepe kanguru kaplumbağa karakol karanfil karavan kargı karınca
  karnaval karpuz kasaba kaset kaşkol katran kavanoz kavşak kayık
  kayısı kazan kazma kelepçe kemer kepçe kereste kervan kestane keşif
  kılavuz kınalı kırbaç kırlangıç kıta kıvılcım kızak kiler kilim
  kiremit kirpi kitabe kivi klavye koltuk kompas konak konfeti kongre
  korsan kovboy kömür köpük köstebek krater kravat kristal kroki kubbe
  kukla kulübe kumbara kunduz kurdele kurye kutup kuzey kürek kürk
  kütük labirent lale lamba lastik leylek liman limonata lokanta lokomotif
  lüfer madalya mağara makara maket manav mandalina mangal manzara marangoz
  martı maske matara maydanoz mektup mendil meneviş mercan merdiven merhem
  mesaj meşale meşe mevsim meyve mızrak mikrop minder minyatür misafir
  mola mozaik muhtar mumya musluk mühür mürekkep nakış nalbant nane
  nargile nazik nehir neşter niyet nota nöbetçi obruk ocak okyanus
  olimpik olta omurga orak orkestra orman otlak otoyol oyma ozan
  ödül öğle öykü palamut palto palyaço panayır pancar panjur pano
  papatya papyon paraşüt parfüm parke parmak pasaport pasta paten patika
  pazar peçete pelikan pencere penguen perde pergel peron pervane petek
  pınar pırasa piknik pilav pinpon pipo piramit pire piyade podyum
  porselen posta pota prizma prova pudra pusula püskül radar radyo
  raf rıhtım rüzgarlık saatçi sabır sabun sahne sakız salkım saman
  sandal sandık sapan sarmaşık sarnıç sazlık sebze seccade sefer seksek
  selam semaver sembol sepet seramik serçe sergi serinlik seyir seyyah
  sıcaklık sığınak sınav sırık sırma sırtlan sigorta silindir simge simitçi
  sincap sinek sinema siper sirk sirke sitem siyah sofra soğuk
  sokak soluk somun sonbahar sorgu sormak soyut söğüt sözlük sünger
  sürahi sürgün sürücü süs şafak şahin şalvar şamdan şapka şelale
  şemsiye şenlik şerit şifre şimşek şömine şubat tablo tabure taç
  tahıl tahta takvim talih tamir tanık tarak tarçın tarla tartı
  tasarım taşkın tavan tavla tayfun taze tebeşir tedbir tekne telgraf
  temsil tencere teneke tenis tente tepe tepsi terazi terlik termometre
  tersane tesbih testere teşvik teyze tılsım tırmık tiyatro tohum toka
  tomruk topaç toprak torba tornavida totem töre traktör tramvay trampet
  tren tribün trompet tufan tuğla tulumba turna turşu tuş tutkal
  tuval tüfek tülbent tünel türbe tütün uçurtma ufuk uğur ulak
  ummak unvan uydu uygarlık uzaylı üniforma ünlem üzengi vadi vagon
  vaha vakit valiz vampir vantilatör varil vazo vecize veresiye vernik
  vesika viyadük vize volkan vurgu yaba yaka yakut yamaç yangın
  yapboz yaprak yara yarasa yastık yatak yayla yazıt yedek yelken
  yelkovan yemin yengeç yerel yorgan yosun yön yufka yular yumak
  yunus yuva yükseklik yüzük zafer zamk zanaat zarf zehir zemberek
  zemin zencefil zerre zeybek zeytin zırh zihin zil zindan zirve
  ziyafet zorba zürafa
`);
