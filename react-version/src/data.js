// Bütün menyu məlumatları bir yerdə. Yeni məhsul əlavə etmək üçün sadəcə buraya yazın.

export const burgers = [
    {
        name: "Classic Burger",
        price: 12,
        image: "burgers/klasik.jpg",
        description:
            "Xüsusi reseptlə hazırlanmış yumşaq buryoş çörəyi, ağızda əriyən 100% təbii dana əti, üzərində tam ərimiş zəngin Çeddar pendiri, təzə pomidor, marul və qırmızı soğan dilimlərinin mükəmməl ahəngidir. Klassik dadı sevənlər üçün əvəzolunmaz seçimdir.",
    },
    {
        name: "Bikon Burger",
        price: 17,
        image: "burgers/bikon.jpg",
        description:
            "Xüsusi reseptlə hazırlanmış yumşaq buryoş çörəyi, ağızda əriyən 100% təbii dana əti, üzərində tam ərimiş zəngin Çeddar pendiri, xırtıldayan qızılı bikon (bacon) dilimləri, təzə pomidor, marul, qırmızı soğan və xüsusi burger sousunun mükəmməl ahəngidir.",
    },
    {
        name: "Qara Lobya Burger",
        price: 15.5,
        image: "burgers/Qara lobya.jpg",
        description:
            "Xüsusi reseptlə hazırlanmış qızılı-qəhvəyi buryoş çörəyi, qara lobya, qarğıdalı və təzə bibər tikələri ilə zənginləşdirilmiş bitki mənşəli köftə, üzərində tam ərimiş Çeddar pendiri, karamelləşdirilmiş soğan, təzə pomidor, təravətli rukola və xüsusi burger sousunun mükəmməl ahəngidir.",
    },
    {
        name: "Xalapenyo Burger",
        price: 11,
        image: "burgers/xalapenyo.jpg",
        description:
            "Xüsusi reseptlə hazırlanmış yumşaq buryoş çörəyi, ağızda əriyən 100% təbii dana əti, üzərində tam ərimiş zəngin Çeddar pendiri, acısevərlər üçün xüsusi xalapenyo bibər dilimləri, təzə pomidor, marul, qırmızı soğan və yüngül acılı xüsusi burger sousunun mükəmməl ahəngidir.",
    },
    {
        name: "Green Gourmet",
        price: 11,
        image: "burgers/Green Gourmet.jpg",
        description:
            "Xüsusi reseptlə hazırlanmış yumşaq buryoş çörəyi, ağızda əriyən 100% təbii dana əti, üzərində tam ərimiş zəngin Çeddar pendiri, təravətli rukola, xüsusi göyərtili sous və təzə tərəvəzlərin mükəmməl ahəngidir.",
    },
    {
        name: "Avakado Burger",
        price: 11,
        image: "burgers/avakado.jpg",
        description:
            "Hamının sevimlisi, avakadolar ilə ət burgerin xüsusi aromasına əlavə edilən Çeddar pendirinin ahəngini damağlarınızda hiss edin.",
    },
];

export const foods = [
    { name: "French Fries", price: 4, image: "food/frees.jpg", description: "Kajun baharatı ilə hazırlanmış xırtıldayan kartoflar." },
    { name: "Toyuq nuggets və tenders", price: 6, image: "food/toyuq.jpg", description: "Xüsusi ədviyyatlarla marinad olunmuş, xırtıldayan qızılı panko qatı ilə qızardılmış yumşaq toyuq naggetsləri və uzunsov tenderlər. Yanında xüsusi ev üsulu kremli göyərtili sous ilə təqdim olunur." },
    { name: "Soğan halqaları", price: 5, image: "food/sogan.jpg", description: "Xüsusi ədviyyatlarla zənginləşdirilmiş, xırtıldayan qızılı örtüklü soğan halqaları. İçi yumşaq, çölü xırt-xırtlı bu ləzzət hər dişləmədə sizi valeh edəcək." },
    { name: "Pendirli kartof", price: 6, image: "food/pendir kartof.jpg", description: "Xırtıldayan kartof fri, üzərində isti ərimiş çeddar sousu və xırtıldayan bikon tikələri. Pendir sevənlər üçün ideal seçim." },
    { name: "Acılı toyuq qanadları", price: 9, image: "food/acili toyuq qanadlari.jpg", description: "8 ədəd buffalo sousunda bişirilmiş şirəli toyuq qanadı. Yanında sərinləşdirici sarımsaqlı sous və kərəviz çubuqları ilə." },
    { name: "Mozzarella çubuqları", price: 7, image: "food/mozeralla cubuqlari.jpg", description: "Çölü xırtıldayan, içi uzanan isti mozzarella pendiri. 6 ədəd, pomidorlu marinara sousu ilə təqdim olunur." },
    { name: "Kartof dilimləri", price: 4.5, image: "food/kartof dilimleri.jpg", description: "Qabıqlı, rozmarin və sarımsaqla sobada bişirilmiş qalın kartof dilimləri. Yanında xama sousu." },
    { name: "Sezar salatı", price: 8, image: "food/sezar salati.jpg", description: "Təzə aysberq kahısı, qril toyuq, parmezan pendiri, xırtıldayan qrenkilər və klassik Sezar sousu." },
];

export const drinks = [
    { name: "Coca-Cola", price: 2, image: "food/cola.jpg", description: "0.5 L, buzlu" },
    { name: "Fanta", price: 2, image: "food/fanta.jpg", description: "0.5 L, portağal dadlı" },
    { name: "Ev limonadı", price: 4, image: "food/limonad.jpg", description: "Təzə limon, nanə və bal ilə" },
    { name: "Ayran", price: 1.5, image: "food/ayran.png", description: "Təbii, sərin ayran" },
    { name: "Şokoladlı milkşeyk", price: 5, image: "food/skldmilk.png", description: "Dondurma, süd və Belçika şokoladı" },
    { name: "Çiyələkli milkşeyk", price: 5, image: "food/Str.png", description: "Təzə çiyələk və vanil dondurması" },
    { name: "Buzlu çay", price: 3, image: "food/buzlu cay.jpg", description: "Şaftalı dadlı, ev üsulu" },
    { name: "Mineral su", price: 1, image: "food/mineral su.jpg", description: "0.5 L, qazlı və ya qazsız" },
];

export const combos = [
    { name: "Klassik Kombo", price: 16, oldPrice: 18, badge: "-2 AZN", image: "food/combo menyu.jpg", description: "Classic Burger + French Fries + Coca-Cola" },
    { name: "Acılı Kombo", price: 20, oldPrice: 24, badge: "-4 AZN", image: "food/combo menyu 2.jpg", description: "Xalapenyo Burger + Acılı toyuq qanadları + Ev limonadı" },
    { name: "Ailə Kombosu", price: 45, oldPrice: 58, badge: "ƏN SƏRFƏLİ", image: "food/family combo.png", description: "3 Classic Burger + Bikon Burger + 2 French Fries + Soğan halqaları + 4 içki" },
    { name: "Vegetarian Kombo", price: 20, oldPrice: 23, badge: "🌱 VEGETARİAN", image: "food/vegan combo.png", description: "Qara Lobya Burger + Kartof dilimləri + Buzlu çay" },
];

export const branches = [
    { name: "Mərkəz", address: "Nizami küçəsi 45, Səbail rayonu", hours: "10:00 – 02:00", phone: "+994 12 555 10 10" },
    { name: "Nərimanov", address: "Təbriz küçəsi 12, Nərimanov rayonu", hours: "10:00 – 00:00", phone: "+994 12 555 20 20" },
    { name: "Xətai", address: "Babək prospekti 88, Xətai rayonu", hours: "11:00 – 01:00", phone: "+994 12 555 30 30" },
    { name: "Yasamal", address: "Şərifzadə küçəsi 7, Yasamal rayonu", hours: "10:00 – 00:00", phone: "+994 12 555 40 40" },
];

export const jobs = [
    { title: "Aşpaz", icon: "👨‍🍳", salary: "1500 – 2000 AZN", description: "Burger və qəlyanaltıların hazırlanması, mətbəxin təmizliyinə nəzarət." },
    { title: "Kassir", icon: "💳", salary: "750 AZN", description: "Müştərilərin qarşılanması, sifarişlərin qəbulu və ödənişlər." },
    { title: "Kuryer", icon: "🛵", salary: "800 AZN", description: "Sifarişlərin Bakı ərazisində vaxtında çatdırılması. Sürücülük vəsiqəsi tələb olunur." },
];
