document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 40;
    let filteredData = [];
    let allData = [];
    let isPlaying = false; // Ses çalıyor mu kontrolü
    let currentSpeed = 1; // Başlangıçta okuma hızı 1

    // JSON verisini yükle
    fetch('assets/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('JSON dosyası yüklenemedi');
            }
            return response.json();
        })
        .then(data => {
            allData = data;
            filteredData = allData; // Başlangıçta tüm veriyi kullan
            loadCards(filteredData, currentPage, itemsPerPage);
            setupLoadMoreButton();
            setupSpeedControl(); // Hız kontrolünü başlat
        })
        .catch(error => {
            alert('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Hata:', error);
        });

    // Kartları yükleme fonksiyonu
    function loadCards(data, page, itemsPerPage, append = false) {
        const cardContainer = document.getElementById('card-container');
        if (!append) cardContainer.innerHTML = ''; // Önceki kartları temizle

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);

        if (paginatedData.length === 0 && !append) {
            cardContainer.innerHTML = '<p>Sonuç bulunamadı.</p>';
            return;
        }

        paginatedData.forEach(item => {
            const card = createCard(item);
            cardContainer.appendChild(card);
        });

        // "Daha Fazla Göster" butonunu güncelle
        const loadMoreButton = document.getElementById('load-more-button');
        if (data.length <= page * itemsPerPage) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
    }

    // Kart oluşturma fonksiyonu
    function createCard(item) {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = createCardFront(item);
        const cardBack = createCardBack(item);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', () => handleCardClick(cardInner, item));
        return card;
    }

    // Kart ön yüzünü oluşturma
    function createCardFront(item) {
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const arabicWord = document.createElement('div');
        arabicWord.classList.add('card-text');
        arabicWord.innerText = item.kelime;  // Arapça kelime

        const arabicReading = document.createElement('div');
        arabicReading.classList.add('arapca-okunus');
        arabicReading.innerText = item.translit;  // Arapça okunuş

        cardFront.appendChild(arabicWord);
        cardFront.appendChild(arabicReading);
        return cardFront;
    }

    // Kart arka yüzünü oluşturma
function createCardBack(item) {
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    
    const turkishMeaning = document.createElement('div');
    turkishMeaning.classList.add('meaning');
    turkishMeaning.innerText = item.anlam;  // Türkçe anlam

    const rootWord = document.createElement('div');
    rootWord.classList.add('root-word');  // Köken kelimesi için yeni bir sınıf ekledik
    rootWord.innerText = item.kok;  // Arapça kök bilgisi

    cardBack.appendChild(turkishMeaning);
    cardBack.appendChild(rootWord);  // Kök bilgisini ekledik
    return cardBack;
}


    // Kart tıklama işlemi
    function handleCardClick(cardInner, item) {
        if (isPlaying) return;

        isPlaying = true;

        const audio = new Audio(item.ses_dosyasi);  // Ses dosyasını yükle
        audio.playbackRate = currentSpeed;  // Hız ayarı
        audio.play();

        audio.onended = () => {
            cardInner.style.transform = '';
            isPlaying = false;
        };

        cardInner.style.transform = 'rotateY(180deg)';
    }

    // "Daha Fazla Göster" butonunun fonksiyonu
    function setupLoadMoreButton() {
        const loadMoreButton = document.getElementById('load-more-button');
        loadMoreButton.addEventListener('click', () => {
            currentPage++;
            loadCards(filteredData, currentPage, itemsPerPage, true);
        });
    }

    // Hız kontrolü ayarı
    function setupSpeedControl() {
        const speedControl = document.getElementById('speed');
        const speedValue = document.getElementById('speed-value');

        speedControl.addEventListener('input', () => {
            currentSpeed = parseFloat(speedControl.value);
            speedValue.innerText = currentSpeed.toFixed(1);  // Hız değerini güncelle
        });
    }
});
