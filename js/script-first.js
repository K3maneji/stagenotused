// Пароль для админки (ЗАМЕНИТЕ НА СВОЙ СЛОЖНЫЙ ПАРОЛЬ)
        const ADMIN_PASSWORD = "StageNotUsedAdmin2024!";

        // Глобальные переменные
        let productsData = {};
        let currentEditingId = null;
        let uploadedImages = []; // Массив для хранения загруженных изображений

        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthentication();
            loadProductsData();
            setupEventListeners();
            updateStats();
            loadUploadedImages();
        });

        // Функции аутентификации
        function checkAuthentication() {
            const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
            
            if (isAuthenticated === 'true') {
                // Пользователь уже аутентифицирован
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-content').style.display = 'block';
            } else {
                // Показываем форму входа
                document.getElementById('admin-login').style.display = 'flex';
                document.getElementById('admin-content').style.display = 'none';
                
                // Добавляем обработчик нажатия Enter в поле пароля
                document.getElementById('admin-password').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        checkAdminPassword();
                    }
                });
            }
        }

        function checkAdminPassword() {
            const input = document.getElementById('admin-password').value;
            const errorElement = document.getElementById('login-error');
            
            if (input === ADMIN_PASSWORD) {
                // Успешная аутентификация
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-content').style.display = 'block';
                sessionStorage.setItem('adminAuthenticated', 'true');
                errorElement.style.display = 'none';
                
                // Очищаем поле пароля
                document.getElementById('admin-password').value = '';
            } else {
                // Неверный пароль
                errorElement.style.display = 'block';
                document.getElementById('admin-password').value = '';
                document.getElementById('admin-password').focus();
                
                // Добавляем анимацию ошибки
                errorElement.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    errorElement.style.animation = '';
                }, 500);
            }
        }

        function logoutAdmin() {
            if (confirm('Вы уверены, что хотите выйти из админ-панели?')) {
                sessionStorage.removeItem('adminAuthenticated');
                window.location.reload();
            }
        }

        // Добавляем CSS анимацию для ошибки
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Функции для навигации
        function showSection(sectionId) {
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.getElementById(sectionId + '-section').classList.add('active');
            
            const buttons = document.querySelectorAll('.nav-btn');
            buttons.forEach(btn => {
                if (btn.textContent.includes(getSectionName(sectionId))) {
                    btn.classList.add('active');
                }
            });
            
            if (sectionId === 'stats') {
                updateStats();
            } else if (sectionId === 'storage') {
                showStorageStats();
            }
        }

        function getSectionName(sectionId) {
            const names = {
                'products': 'Управление товарами',
                'brands': 'Управление брендами',
                'import': 'Импорт/Экспорт',
                'stats': 'Статистика',
                'storage': 'Хранилище'
            };
            return names[sectionId] || sectionId;
        }

        function setupEventListeners() {
            const productForm = document.getElementById('product-form');
            if (productForm) {
                productForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    saveProduct();
                });
            }
        }

        // Загрузка и сохранение данных
        function loadProductsData() {
            const savedData = localStorage.getItem('stageNotUsedProducts');
            if (savedData) {
                try {
                    productsData = JSON.parse(savedData);
                    updateProductsList();
                } catch (e) {
                    console.error('Ошибка загрузки данных:', e);
                    showAlert('Ошибка загрузки данных', 'danger');
                    productsData = {};
                }
            } else {
                productsData = {};
            }
        }

        function saveToStorage() {
            try {
                localStorage.setItem('stageNotUsedProducts', JSON.stringify(productsData));
                updateProductsList();
                updateStats();
                return true;
            } catch (e) {
                console.error('Ошибка сохранения:', e);
                showAlert('Ошибка сохранения данных', 'danger');
                return false;
            }
        }

        // Управление загрузкой изображений
        function handleImageUpload(files) {
            if (!files || files.length === 0) return;
            
            const progressBar = document.getElementById('upload-progress');
            const progressFill = document.getElementById('upload-progress-bar');
            progressBar.style.display = 'block';
            
            let processed = 0;
            
            Array.from(files).forEach(file => {
                if (!file.type.match('image.*')) {
                    showAlert(`Файл "${file.name}" не является изображением`, 'warning');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Создаем уникальный ID для изображения
                    const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    // Сохраняем изображение в localStorage
                    const imageData = {
                        id: imageId,
                        name: file.name,
                        data: e.target.result,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    // Добавляем в массив загруженных изображений
                    uploadedImages.push(imageData);
                    
                    // Сохраняем в localStorage
                    saveUploadedImages();
                    
                    // Добавляем превью
                    addImagePreview(imageData);
                    
                    // Обновляем прогресс
                    processed++;
                    progressFill.style.width = (processed / files.length) * 100 + '%';
                    
                    if (processed === files.length) {
                        setTimeout(() => {
                            progressBar.style.display = 'none';
                            progressFill.style.width = '0%';
                        }, 1000);
                        
                        showAlert(`Успешно загружено ${files.length} изображений`, 'success');
                    }
                };
                
                reader.onerror = function() {
                    showAlert(`Ошибка при загрузке файла "${file.name}"`, 'danger');
                    processed++;
                };
                
                reader.readAsDataURL(file);
            });
        }

        function addImagePreview(imageData) {
            const container = document.getElementById('images-upload-container');
            
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${imageData.data}" alt="${imageData.name}">
                <button type="button" class="remove-btn" onclick="removeImagePreview('${imageData.id}', this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Вставляем перед кнопкой загрузки
            const uploadBtn = container.querySelector('.upload-btn');
            container.insertBefore(preview, uploadBtn);
        }

        function removeImagePreview(imageId, button) {
            // Удаляем из массива
            uploadedImages = uploadedImages.filter(img => img.id !== imageId);
            
            // Сохраняем изменения
            saveUploadedImages();
            
            // Удаляем превью
            button.parentElement.remove();
            
            showAlert('Изображение удалено', 'info');
        }

        function saveUploadedImages() {
            try {
                localStorage.setItem('stageNotUsedUploadedImages', JSON.stringify(uploadedImages));
            } catch (e) {
                console.error('Ошибка сохранения изображений:', e);
                showAlert('Ошибка сохранения изображений', 'danger');
            }
        }

        function loadUploadedImages() {
            try {
                const savedImages = localStorage.getItem('stageNotUsedUploadedImages');
                if (savedImages) {
                    uploadedImages = JSON.parse(savedImages);
                }
            } catch (e) {
                console.error('Ошибка загрузки изображений:', e);
                uploadedImages = [];
            }
        }

        // Управление товарами
        function saveProduct() {
            const brand = document.getElementById('product-brand').value;
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const description = document.getElementById('product-description').value;
            
            if (!brand || !name || !price || !description) {
                showAlert('Пожалуйста, заполните все обязательные поля', 'danger');
                return;
            }
            
            // Собираем ID загруженных изображений
            const imageIds = [];
            const container = document.getElementById('images-upload-container');
            container.querySelectorAll('.image-preview').forEach(preview => {
                const img = preview.querySelector('img');
                const src = img.src;
                // Находим изображение в uploadedImages по data URL
                const imageData = uploadedImages.find(img => img.data === src);
                if (imageData) {
                    imageIds.push(imageData.id);
                }
            });
            
            const productData = {
                id: currentEditingId || Date.now(),
                name: name,
                description: description,
                price: price,
                imageIds: imageIds, // Сохраняем ID изображений вместо URL
                specs: collectSpecs('specs-container'),
                color: collectSpecs('color-container'),
                gobo: collectSpecs('gobo-container'),
                frame: collectSpecs('frame-container'),
                videos: collectVideos(),
                downloads: collectDownloads()
            };
            
            if (!productsData[brand]) {
                productsData[brand] = [];
            }
            
            if (currentEditingId) {
                const index = productsData[brand].findIndex(p => p.id === currentEditingId);
                if (index !== -1) {
                    productsData[brand][index] = productData;
                    showAlert('Товар успешно обновлен!', 'success');
                } else {
                    showAlert('Ошибка: товар для редактирования не найден', 'danger');
                    return;
                }
            } else {
                productsData[brand].push(productData);
                showAlert('Товар успешно добавлен!', 'success');
            }
            
            if (saveToStorage()) {
                resetForm();
            }
        }

        function collectSpecs(containerId) {
            const specs = [];
            const container = document.getElementById(containerId);
            if (!container) return specs;
            
            container.querySelectorAll('.dynamic-field').forEach(item => {
                const nameInput = item.querySelector('.spec-name');
                const valueInput = item.querySelector('.spec-value');
                
                if (nameInput && valueInput) {
                    const name = nameInput.value.trim();
                    const value = valueInput.value.trim();
                    if (name && value) {
                        specs.push({ name: name, value: value });
                    }
                }
            });
            
            return specs;
        }

        function collectVideos() {
            const videos = [];
            const container = document.getElementById('videos-container');
            if (!container) return videos;
            
            container.querySelectorAll('.dynamic-field').forEach(item => {
                const titleInput = item.querySelector('.video-title');
                const descInput = item.querySelector('.video-description');
                const urlInput = item.querySelector('.video-url');
                
                if (titleInput && urlInput) {
                    const title = titleInput.value.trim();
                    const description = descInput ? descInput.value.trim() : '';
                    const url = urlInput.value.trim();
                    if (title && url) {
                        videos.push({ title: title, description: description, url: url });
                    }
                }
            });
            
            return videos;
        }

        function collectDownloads() {
            const downloads = [];
            const container = document.getElementById('downloads-container');
            if (!container) return downloads;
            
            container.querySelectorAll('.dynamic-field').forEach(item => {
                const nameInput = item.querySelector('.download-name');
                const descInput = item.querySelector('.download-description');
                const urlInput = item.querySelector('.download-url');
                
                if (nameInput && urlInput) {
                    const name = nameInput.value.trim();
                    const description = descInput ? descInput.value.trim() : '';
                    const url = urlInput.value.trim();
                    
                    if (name && url) {
                        downloads.push({ 
                            name: name, 
                            description: description, 
                            url: url
                        });
                    }
                }
            });
            
            return downloads;
        }

        // Динамическое добавление полей
        function addSpecField(type) {
            const container = document.getElementById(type + '-container');
            if (!container) return;
            
            const newField = document.createElement('div');
            newField.className = 'dynamic-field';
            newField.innerHTML = `
                <input type="text" class="spec-name" placeholder="Название параметра" style="width: 100%; margin-bottom: 10px;">
                <input type="text" class="spec-value" placeholder="Значение параметра" style="width: 100%;">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            `;
            container.appendChild(newField);
        }

        function addVideoField() {
            const container = document.getElementById('videos-container');
            if (!container) return;
            
            const newField = document.createElement('div');
            newField.className = 'dynamic-field';
            newField.innerHTML = `
                <input type="text" class="video-title" placeholder="Название видео" style="width: 100%; margin-bottom: 10px;">
                <input type="text" class="video-description" placeholder="Описание видео" style="width: 100%; margin-bottom: 10px;">
                <input type="text" class="video-url" placeholder="https://youtube.com/embed/..." style="width: 100%;">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            `;
            container.appendChild(newField);
        }

        function addDownloadField() {
            const container = document.getElementById('downloads-container');
            if (!container) return;
            
            const newField = document.createElement('div');
            newField.className = 'dynamic-field';
            newField.innerHTML = `
                <input type="text" class="download-name" placeholder="Название документа" style="width: 100%; margin-bottom: 10px;">
                <input type="text" class="download-description" placeholder="Описание документа" style="width: 100%; margin-bottom: 10px;">
                <input type="text" class="download-url" placeholder="https://example.com/document.pdf" style="width: 100%;">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            `;
            container.appendChild(newField);
        }

        // Управление списком товаров
        function updateProductsList() {
            const container = document.getElementById('products-list-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            let hasProducts = false;
            
            for (const brand in productsData) {
                if (productsData.hasOwnProperty(brand)) {
                    productsData[brand].forEach(product => {
                        hasProducts = true;
                        
                        // Получаем первое изображение товара
                        let firstImageSrc = '';
                        if (product.imageIds && product.imageIds.length > 0) {
                            const firstImageId = product.imageIds[0];
                            const imageData = uploadedImages.find(img => img.id === firstImageId);
                            if (imageData) {
                                firstImageSrc = imageData.data;
                            }
                        }
                        
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.innerHTML = `
                            <div class="product-image">
                                ${firstImageSrc ? 
                                    `<img src="${firstImageSrc}" alt="${product.name}">` : 
                                    '<i class="fas fa-box" style="font-size: 3rem; color: #FFD700;"></i>'
                                }
                            </div>
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">${product.price}</div>
                            <div class="product-actions">
                                <button class="btn btn-sm btn-primary" onclick="editProduct('${brand}', ${product.id})">
                                    <i class="fas fa-edit"></i> Редактировать
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${brand}', ${product.id})">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            </div>
                        `;
                        container.appendChild(productCard);
                    });
                }
            }
            
            if (!hasProducts) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #FFD700;">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3>Товары не найдены</h3>
                        <p>Добавьте первый товар используя форму выше</p>
                    </div>
                `;
            }
        }

        function editProduct(brand, productId) {
            const product = productsData[brand] ? productsData[brand].find(p => p.id === productId) : null;
            if (!product) {
                showAlert('Товар не найден', 'danger');
                return;
            }
            
            currentEditingId = productId;
            
            document.getElementById('product-brand').value = brand;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description;
            
            // Очищаем контейнер с изображениями
            const imagesContainer = document.getElementById('images-upload-container');
            imagesContainer.innerHTML = '<div class="upload-btn" onclick="document.getElementById(\'image-upload\').click()"><i class="fas fa-cloud-upload-alt"></i><span>Загрузить изображение</span></div>';
            
            // Добавляем превью для существующих изображений
            if (product.imageIds && product.imageIds.length > 0) {
                product.imageIds.forEach(imageId => {
                    const imageData = uploadedImages.find(img => img.id === imageId);
                    if (imageData) {
                        addImagePreview(imageData);
                    }
                });
            }
            
            fillSpecFields('specs-container', product.specs);
            fillSpecFields('color-container', product.color);
            fillSpecFields('gobo-container', product.gobo);
            fillSpecFields('frame-container', product.frame);
            fillVideoFields(product.videos);
            fillDownloadFields(product.downloads);
            
            document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
            showAlert('Редактирование товара. Не забудьте сохранить изменения.', 'info');
        }

        function fillSpecFields(containerId, specs) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';
            
            if (specs && specs.length > 0) {
                specs.forEach(spec => {
                    const newField = document.createElement('div');
                    newField.className = 'dynamic-field';
                    newField.innerHTML = `
                        <input type="text" class="spec-name" value="${spec.name}" style="width: 100%; margin-bottom: 10px;">
                        <input type="text" class="spec-value" value="${spec.value}" style="width: 100%;">
                        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                    container.appendChild(newField);
                });
            } else {
                const type = containerId.replace('-container', '');
                addSpecField(type);
            }
        }

        function fillVideoFields(videos) {
            const container = document.getElementById('videos-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            if (videos && videos.length > 0) {
                videos.forEach(video => {
                    const newField = document.createElement('div');
                    newField.className = 'dynamic-field';
                    newField.innerHTML = `
                        <input type="text" class="video-title" value="${video.title}" style="width: 100%; margin-bottom: 10px;">
                        <input type="text" class="video-description" value="${video.description || ''}" style="width: 100%; margin-bottom: 10px;">
                        <input type="text" class="video-url" value="${video.url}" style="width: 100%;">
                        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                    container.appendChild(newField);
                });
            } else {
                addVideoField();
            }
        }

        function fillDownloadFields(downloads) {
            const container = document.getElementById('downloads-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            if (downloads && downloads.length > 0) {
                downloads.forEach(download => {
                    const newField = document.createElement('div');
                    newField.className = 'dynamic-field';
                    newField.innerHTML = `
                        <input type="text" class="download-name" value="${download.name}" style="width: 100%; margin-bottom: 10px;">
                        <input type="text" class="download-description" value="${download.description || ''}" style="width: 100%; margin-bottom: 10px;">
                        <input type="text" class="download-url" value="${download.url}" style="width: 100%;">
                        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                    container.appendChild(newField);
                });
            } else {
                addDownloadField();
            }
        }

        function deleteProduct(brand, productId) {
            if (confirm('Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.')) {
                if (productsData[brand]) {
                    productsData[brand] = productsData[brand].filter(p => p.id !== productId);
                    if (productsData[brand].length === 0) {
                        delete productsData[brand];
                    }
                    saveToStorage();
                    showAlert('Товар успешно удален', 'success');
                }
            }
        }

        function resetForm() {
            const form = document.getElementById('product-form');
            if (form) {
                form.reset();
            }
            currentEditingId = null;
            
            // Очищаем контейнер с изображениями
            const imagesContainer = document.getElementById('images-upload-container');
            imagesContainer.innerHTML = '<div class="upload-btn" onclick="document.getElementById(\'image-upload\').click()"><i class="fas fa-cloud-upload-alt"></i><span>Загрузить изображение</span></div>';
            
            const containers = [
                'specs-container', 
                'color-container',
                'gobo-container',
                'frame-container',
                'videos-container',
                'downloads-container'
            ];
            
            containers.forEach(containerId => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                }
            });
            
            addSpecField('specs');
            addSpecField('color');
            addSpecField('gobo');
            addSpecField('frame');
            addVideoField();
            addDownloadField();
            
            showAlert('Форма очищена', 'info');
        }

        // Вспомогательные функции
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            if (!container) return;
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <i class="fas fa-${getAlertIcon(type)}"></i> ${message}
                <button type="button" class="btn btn-sm" onclick="this.parentElement.remove()" style="float: right; background: transparent; color: inherit;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 5000);
        }

        function getAlertIcon(type) {
            const icons = {
                'success': 'check-circle',
                'danger': 'exclamation-triangle',
                'warning': 'exclamation-circle',
                'info': 'info-circle'
            };
            return icons[type] || 'info-circle';
        }

        function updateStats() {
            let totalProducts = 0;
            let totalBrands = 0;
            let totalImages = 0;
            let totalDocs = 0;
            
            for (const brand in productsData) {
                if (productsData.hasOwnProperty(brand)) {
                    totalBrands++;
                    if (Array.isArray(productsData[brand])) {
                        productsData[brand].forEach(product => {
                            totalProducts++;
                            if (product.imageIds && Array.isArray(product.imageIds)) {
                                totalImages += product.imageIds.length;
                            }
                            if (product.downloads && Array.isArray(product.downloads)) {
                                totalDocs += product.downloads.length;
                            }
                        });
                    }
                }
            }
            
            const elements = {
                'total-products': totalProducts,
                'total-brands': totalBrands,
                'total-images': totalImages,
                'total-docs': totalDocs
            };
            
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            }
        }

        function clearStorage() {
            if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
                localStorage.removeItem('stageNotUsedProducts');
                localStorage.removeItem('stageNotUsedUploadedImages');
                productsData = {};
                uploadedImages = [];
                updateProductsList();
                updateStats();
                showAlert('Все данные очищены', 'success');
            }
        }

        // Импорт/Экспорт
        function exportToJson() {
            const exportData = {
                products: productsData,
                images: uploadedImages,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            try {
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'stageNotUsed-backup-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);
                showAlert('Данные успешно экспортированы в JSON файл', 'success');
            } catch (e) {
                console.error('Ошибка экспорта:', e);
                showAlert('Ошибка при экспорте данных', 'danger');
            }
        }

        function importFromJson() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        if (importedData.products) {
                            productsData = importedData.products;
                        }
                        
                        if (importedData.images) {
                            uploadedImages = importedData.images;
                            saveUploadedImages();
                        }
                        
                        saveToStorage();
                        showAlert('Данные успешно импортированы из JSON файла', 'success');
                    } catch (error) {
                        console.error('Ошибка импорта:', error);
                        showAlert('Ошибка при импорте файла: неверный формат JSON', 'danger');
                    }
                };
                reader.onerror = function() {
                    showAlert('Ошибка при чтении файла', 'danger');
                };
                reader.readAsText(file);
            };
            input.click();
        }

        // Управление хранилищем
        function showStorageStats() {
            const container = document.getElementById('storage-stats-container');
            if (!container) return;
            
            // Собираем все используемые ID изображений
            const usedImageIds = new Set();
            for (const brand in productsData) {
                if (productsData.hasOwnProperty(brand)) {
                    productsData[brand].forEach(product => {
                        if (product.imageIds) {
                            product.imageIds.forEach(id => usedImageIds.add(id));
                        }
                    });
                }
            }
            
            // Находим неиспользуемые изображения
            const unusedImages = uploadedImages.filter(img => !usedImageIds.has(img.id));
            
            // Вычисляем общий размер изображений
            let totalSize = 0;
            uploadedImages.forEach(img => {
                // Приблизительный расчет размера (base64 примерно на 33% больше исходного)
                if (img.data) {
                    totalSize += img.data.length * 0.75; // Примерный размер в байтах
                }
            });
            
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
            
            container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${uploadedImages.length}</div>
                        <div class="stat-label">Всего изображений</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${usedImageIds.size}</div>
                        <div class="stat-label">Используется</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${unusedImages.length}</div>
                        <div class="stat-label">Не используется</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${sizeInMB} MB</div>
                        <div class="stat-label">Общий размер</div>
                    </div>
                </div>
                
                ${unusedImages.length > 0 ? `
                    <div class="alert alert-warning" style="margin-top: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Найдено ${unusedImages.length} неиспользуемых изображений. 
                        Вы можете удалить их для освобождения места.
                    </div>
                ` : ''}
            `;
        }

        function cleanupUnusedImages() {
            // Собираем все используемые ID изображений
            const usedImageIds = new Set();
            for (const brand in productsData) {
                if (productsData.hasOwnProperty(brand)) {
                    productsData[brand].forEach(product => {
                        if (product.imageIds) {
                            product.imageIds.forEach(id => usedImageIds.add(id));
                        }
                    });
                }
            }
            
            // Фильтруем массив uploadedImages, оставляя только используемые
            const beforeCount = uploadedImages.length;
            uploadedImages = uploadedImages.filter(img => usedImageIds.has(img.id));
            const removedCount = beforeCount - uploadedImages.length;
            
            // Сохраняем изменения
            saveUploadedImages();
            
            showAlert(`Удалено ${removedCount} неиспользуемых изображений`, 'success');
            showStorageStats();
        }