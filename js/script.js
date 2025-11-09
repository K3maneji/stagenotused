// Глобальные переменные
        let productsData = {};
        let uploadedImages = [];
        let currentBrand = '';
        let currentSlideIndex = 0;
        let currentProductImages = [];

        // Элементы DOM
        const preloader = document.getElementById('preloader');
        const header = document.querySelector('header');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const brandCards = document.querySelectorAll('.brand-card');
        const sections = document.querySelectorAll('section');
        const searchInput = document.getElementById('search-input');
        const productsContainer = document.getElementById('products-container');
        const productModal = document.getElementById('product-modal');
        const orderModal = document.getElementById('order-modal');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        const orderForm = document.getElementById('order-form');
        const feedbackForm = document.getElementById('feedback-form');
        const navLinksAll = document.querySelectorAll('.nav-link, .footer-links a');
        const backgroundVideo = document.getElementById('background-video');
        const catalogTitle = document.getElementById('catalog-title');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const carouselContainer = document.querySelector('.carousel-container');
        const carouselPrev = document.querySelector('.carousel-prev');
        const carouselNext = document.querySelector('.carousel-next');
        const carouselIndicators = document.querySelector('.carousel-indicators');

        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            loadProductsData();
            showSection('home');
            
            setupVideoBackground();
            
            initEventListeners();
            
            setTimeout(function() {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 1500);
        });

        // Загрузка данных из localStorage
        function loadProductsData() {
            try {
                // Загружаем товары
                const savedProducts = localStorage.getItem('stageNotUsedProducts');
                if (savedProducts) {
                    productsData = JSON.parse(savedProducts);
                } else {
                    // Если данных нет, используем демо-данные
                    productsData = getDemoData();
                }
                
                // Загружаем изображения
                const savedImages = localStorage.getItem('stageNotUsedUploadedImages');
                if (savedImages) {
                    uploadedImages = JSON.parse(savedImages);
                }
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
                productsData = getDemoData();
            }
        }

        // Демо-данные для случая, если в localStorage ничего нет
        function getDemoData() {
            return {
                "pr-lighting-ltd": [
                    {
                        id: 1,
                        name: "PR-6000 Framing (1400 Вт)",
                        description: "PR-6000 Framing (1400 Вт) — это подвижная головка для обрамления и точечного освещения с использованием лампы Orsam lok-it 1400/PS и диапазоном масштабирования от 6 до 55 градусов.",
                        price: "245 000 ₽",
                        imageIds: [],
                        specs: [
                            { name: "Входное напряжение", value: "208В-240 В переменного тока, 50/60 Гц" },
                            { name: "Номинальная мощность", value: "1800 Вт при 220 В" }
                        ],
                        color: [
                            { name: "CMY", value: "Система линейного смешивания CMY с макросами" }
                        ],
                        gobo: [
                            { name: "Гобо-колесо", value: "2 вращающихся гобо-колеса с индексным позиционированием" }
                        ],
                        frame: [
                            { name: "Материал корпуса", value: "Прочный алюминиевый сплав" }
                        ],
                        videos: [],
                        downloads: []
                    }
                ]
            };
        }

        // Получение изображения по ID
        function getProductImage(imageId) {
            const imageData = uploadedImages.find(img => img.id === imageId);
            return imageData ? imageData.data : null;
        }

        // Получение изображений товара
        function getProductImages(product) {
            if (product.imageIds && product.imageIds.length > 0) {
                const images = [];
                product.imageIds.forEach(imageId => {
                    const imageSrc = getProductImage(imageId);
                    if (imageSrc) {
                        images.push(imageSrc);
                    }
                });
                return images.length > 0 ? images : ['https://via.placeholder.com/400x300/333333/FFD700?text=Нет+изображения'];
            }
            return ['https://via.placeholder.com/400x300/333333/FFD700?text=Нет+изображения'];
        }

        function setupVideoBackground() {
            backgroundVideo.loop = true;
            backgroundVideo.autoplay = true;
            backgroundVideo.muted = true;
            backgroundVideo.playsInline = true;
            
            backgroundVideo.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            });
            
            backgroundVideo.addEventListener('loadeddata', function() {
                this.play().catch(function(error) {
                    console.log('Автовоспроизведение видео заблокировано:', error);
                });
            });
        }

        function initEventListeners() {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });

            brandCards.forEach(card => {
                card.addEventListener('click', function() {
                    const brand = this.getAttribute('data-brand');
                    currentBrand = brand;
                    showCatalogByBrand(brand);
                    showSection('catalog');
                });
            });

            navLinksAll.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = this.getAttribute('data-target');
                    
                    if (target === 'catalog') {
                        currentBrand = '';
                        showAllProducts();
                    }
                    
                    if (target) {
                        showSection(target);
                    }
                    
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
                });
            });

            searchInput.addEventListener('input', function() {
                filterProducts(this.value);
            });

            closeModalButtons.forEach(button => {
                button.addEventListener('click', function() {
                    productModal.style.display = 'none';
                    orderModal.style.display = 'none';
                });
            });

            window.addEventListener('click', function(e) {
                if (e.target === productModal) {
                    productModal.style.display = 'none';
                }
                if (e.target === orderModal) {
                    orderModal.style.display = 'none';
                }
            });

            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    document.getElementById(`${tabId}-content`).classList.add('active');
                });
            });

            carouselPrev.addEventListener('click', function() {
                showSlide(currentSlideIndex - 1);
            });

            carouselNext.addEventListener('click', function() {
                showSlide(currentSlideIndex + 1);
            });

            orderForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                orderModal.style.display = 'none';
                orderForm.reset();
            });

            feedbackForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Спасибо за ваше сообщение! Мы рассмотрим его в ближайшее время.');
                feedbackForm.reset();
            });
        }

        function showSection(sectionId) {
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            document.getElementById(sectionId).style.display = 'block';
            
            window.scrollTo(0, 0);
        }

        function showCatalogByBrand(brand) {
            const products = productsData[brand] || [];
            displayProducts(products);
            
            const brandName = document.querySelector(`.brand-card[data-brand="${brand}"] .brand-name`).textContent;
            catalogTitle.textContent = `Каталог оборудования ${brandName}`;
        }

        function showAllProducts() {
            let allProducts = [];
            
            for (const brand in productsData) {
                allProducts = allProducts.concat(productsData[brand]);
            }
            
            displayProducts(allProducts);
            catalogTitle.textContent = 'Весь каталог оборудования';
        }

        function displayProducts(products) {
            productsContainer.innerHTML = '';
            
            if (products.length === 0) {
                productsContainer.innerHTML = '<p style="text-align: center; width: 100%;">Товары не найдены</p>';
                return;
            }
            
            products.forEach(product => {
                const productImages = getProductImages(product);
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${productImages[0]}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300/333333/FFD700?text=Ошибка+загрузки'">
                    </div>
                    <div class="product-content">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price}</div>
                        <div class="product-actions">
                            <button class="btn btn-outline details-btn" data-id="${product.id}">Подробнее</button>
                            <button class="btn btn-primary order-btn" data-id="${product.id}">Заказать</button>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(productCard);
            });
            
            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    showProductDetails(productId);
                });
            });
            
            document.querySelectorAll('.order-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    showOrderModal(productId);
                });
            });
        }

        function showProductDetails(productId) {
            const product = findProductById(productId);
            if (!product) return;
            
            document.getElementById('modal-product-title').textContent = product.name;
            document.getElementById('modal-product-desc').textContent = product.description;
            
            currentProductImages = getProductImages(product);
            currentSlideIndex = 0;
            setupCarousel(currentProductImages);
            
            // Заполняем характеристики
            fillTabContent('modal-product-specs', product.specs);
            fillTabContent('modal-product-color', product.color);
            fillTabContent('modal-product-gobo', product.gobo);
            fillTabContent('modal-product-frame', product.frame);
            
            // Заполняем видео
            const videoContent = document.getElementById('modal-product-video');
            videoContent.innerHTML = '';
            
            if (product.videos && product.videos.length > 0) {
                product.videos.forEach(video => {
                    const videoItem = document.createElement('div');
                    videoItem.className = 'video-item';
                    videoItem.innerHTML = `
                        <h4>${video.title}</h4>
                        <p>${video.description}</p>
                        <div class="video-wrapper">
                            <iframe src="${video.url}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    `;
                    videoContent.appendChild(videoItem);
                });
            } else {
                videoContent.innerHTML = '<p>Видео не доступны</p>';
            }
            
            // Заполняем документацию
            const downloadsContent = document.getElementById('modal-product-downloads');
            downloadsContent.innerHTML = '';
            
            if (product.downloads && product.downloads.length > 0) {
                product.downloads.forEach(item => {
                    const downloadItem = document.createElement('div');
                    downloadItem.className = 'download-item';
                    downloadItem.innerHTML = `
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <a href="#" class="download-btn" data-file="${item.name}">Скачать документ</a>
                    `;
                    downloadsContent.appendChild(downloadItem);
                });
                
                document.querySelectorAll('.download-btn').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const fileName = this.getAttribute('data-file');
                        alert(`Начато скачивание файла: ${fileName}`);
                    });
                });
            } else {
                downloadsContent.innerHTML = '<p>Документация не доступна</p>';
            }
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector('.tab[data-tab="specs"]').classList.add('active');
            document.getElementById('specs-content').classList.add('active');
            
            productModal.style.display = 'flex';
        }

        function fillTabContent(containerId, items) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            if (items && items.length > 0) {
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'info-section';
                    itemElement.innerHTML = `
                        <h4>${item.name}</h4>
                        <p>${item.value}</p>
                    `;
                    container.appendChild(itemElement);
                });
            } else {
                container.innerHTML = '<p>Информация не указана</p>';
            }
        }

        function setupCarousel(images) {
            carouselContainer.innerHTML = '';
            carouselIndicators.innerHTML = '';
            
            if (images.length === 0) {
                const noImageSlide = document.createElement('div');
                noImageSlide.className = 'carousel-slide active';
                noImageSlide.innerHTML = '<p>Изображение не доступно</p>';
                carouselContainer.appendChild(noImageSlide);
                return;
            }
            
            images.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
                slide.innerHTML = `<img src="${image}" alt="Изображение товара ${index + 1}" onerror="this.style.display='none'">`;
                carouselContainer.appendChild(slide);
                
                const indicator = document.createElement('div');
                indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
                indicator.addEventListener('click', () => showSlide(index));
                carouselIndicators.appendChild(indicator);
            });
            
            if (images.length <= 1) {
                carouselPrev.style.display = 'none';
                carouselNext.style.display = 'none';
                carouselIndicators.style.display = 'none';
            } else {
                carouselPrev.style.display = 'flex';
                carouselNext.style.display = 'flex';
                carouselIndicators.style.display = 'flex';
            }
        }

        function showSlide(index) {
            const slides = document.querySelectorAll('.carousel-slide');
            const indicators = document.querySelectorAll('.carousel-indicator');
            
            if (slides.length === 0) return;
            
            if (index >= slides.length) {
                currentSlideIndex = 0;
            } else if (index < 0) {
                currentSlideIndex = slides.length - 1;
            } else {
                currentSlideIndex = index;
            }
            
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            slides[currentSlideIndex].classList.add('active');
            indicators[currentSlideIndex].classList.add('active');
        }

        function showOrderModal(productId) {
            const product = findProductById(productId);
            if (!product) return;
            
            document.getElementById('order-product').value = product.name;
            orderModal.style.display = 'flex';
        }

        function findProductById(productId) {
            for (const brand in productsData) {
                const product = productsData[brand].find(p => p.id === productId);
                if (product) return product;
            }
            return null;
        }

        function filterProducts(searchTerm) {
            let allProducts = [];
            
            if (currentBrand) {
                allProducts = productsData[currentBrand] || [];
            } else {
                for (const brand in productsData) {
                    allProducts = allProducts.concat(productsData[brand]);
                }
            }
            
            if (!searchTerm) {
                displayProducts(allProducts);
                return;
            }
            
            const filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            displayProducts(filteredProducts);
        }