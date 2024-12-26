document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 40;
    let filteredData = [];
    let allData = [];

    // Filtreleme seçenekleri için bir konteyner oluştur
    const filterContainer = document.createElement('div');
    filterContainer.id = 'filter-container';
    filterContainer.innerHTML = `
        <label for="arabic-root-filter">Arapça Kök'e Göre Filtrele:</label>
        <select id="arabic-root-filter">
            <option value="">Tümü</option>
        </select>
        
        <label for="word-type-filter">Kelime Türüne Göre Filtrele:</label>
        <select id="word-type-filter">
            <option value="">Tümü</option>
        </select>
    `;
    document.body.insertBefore(filterContainer, document.getElementById('card-container'));

    // JSON verisini yükle
    fetch('assets/kuran.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('JSON dosyası yüklenemedi');
            }
            return response.json();
        })
        .then(data => {
            allData = data;
            populateFilters(allData); // Filtreleri doldur
            filteredData = removeDuplicates(allData); // Duplikatları kaldır
            loadCards(filteredData, currentPage, itemsPerPage);
            setupLoadMoreButton();
            setupFilterHandlers();
        })
        .catch(error => {
            alert('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Hata:', error);
        });

    // Aynı kelimeleri kaldırma fonksiyonu
    function removeDuplicates(data) {
        const uniqueMap = new Map();
        data.forEach(item => {
            if (!uniqueMap.has(item.arabic_word)) {
                uniqueMap.set(item.arabic_word, item);
            }
        });
        return Array.from(uniqueMap.values());
    }

    // Filtreleri doldurma fonksiyonu
    function populateFilters(data) {
        const arabicRootFilter = document.getElementById('arabic-root-filter');
        const wordTypeFilter = document.getElementById('word-type-filter');

        // Benzersiz Arapça kökleri bul ve ekle
        const uniqueRoots = [...new Set(data.map(item => item.arapca_kok).filter(Boolean))].sort();
        uniqueRoots.forEach(root => {
            const option = document.createElement('option');
            option.value = root;
            option.textContent = root;
            arabicRootFilter.appendChild(option);
        });

        // Benzersiz kelime türlerini bul ve ekle
        const uniqueWordTypes = [...new Set(data.map(item => item.kelime_cinsi1).filter(Boolean))].sort();
        uniqueWordTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            wordTypeFilter.appendChild(option);
        });
    }

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
        card.setAttribute('data-type', item.kelime_cinsi1);

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
        arabicWord.innerText = item.arabic_word;
        const kelimeCinsi = document.createElement('div');
        kelimeCinsi.classList.add('kelime-cinsi');
        kelimeCinsi.innerText = item.kelime_cinsi;
        cardFront.appendChild(arabicWord);
        cardFront.appendChild(kelimeCinsi);
        return cardFront;
    }

    // Kart arka yüzünü oluşturma
    function createCardBack(item) {
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        const turkishMeaning = document.createElement('div');
        turkishMeaning.classList.add('meaning');
        turkishMeaning.innerText = item.turkish_meaning;
        const kelimeCinsi1 = document.createElement('div');
        kelimeCinsi1.classList.add('kelime-cinsi1');
        kelimeCinsi1.innerText = item.kelime_cinsi1;

        if (item.kelime_cinsi1 === 'Fiil') {
            cardBack.classList.add('fiil');
        } else if (item.kelime_cinsi1 === 'İsim') {
            cardBack.classList.add('isim');
        }

        cardBack.appendChild(turkishMeaning);
        cardBack.appendChild(kelimeCinsi1);
        return cardBack;
    }

    // Kart tıklama işlemi
    function handleCardClick(cardInner, item) {
        const utterance = new SpeechSynthesisUtterance(item.arabic_word);
        utterance.lang = 'ar';
        const speedValue = document.getElementById('speed').value;
        utterance.rate = parseFloat(speedValue) || 1.0;
        speechSynthesis.speak(utterance);

        cardInner.style.transform = cardInner.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)';
    }

    // "Daha Fazla Göster" butonunun fonksiyonu
    function setupLoadMoreButton() {
        const loadMoreButton = document.getElementById('load-more-button');
        loadMoreButton.addEventListener('click', () => {
            currentPage++;
            loadCards(filteredData, currentPage, itemsPerPage, true);
        });
    }

    // Filtreleme işlemleri
    function setupFilterHandlers() {
        const arabicRootFilter = document.getElementById('arabic-root-filter');
        const wordTypeFilter = document.getElementById('word-type-filter');

        arabicRootFilter.addEventListener('change', filterData);
        wordTypeFilter.addEventListener('change', filterData);
    }

    // Filtreleme fonksiyonu
    function filterData() {
        const arabicRootValue = document.getElementById('arabic-root-filter').value;
        const wordTypeValue = document.getElementById('word-type-filter').value;

        filteredData = allData.filter(item => {
            const matchesRoot = arabicRootValue ? item.arapca_kok === arabicRootValue : true;
            const matchesType = wordTypeValue ? item.kelime_cinsi1 === wordTypeValue : true;
            return matchesRoot && matchesType;
        });

        loadCards(filteredData, 1, itemsPerPage);
    }
});
