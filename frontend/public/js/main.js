// Função para animar elementos ao rolar a página
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in:not(.visible)');
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('visible');
        }
    });
}

// Menu Mobile e funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    // Toggle do menu mobile
    if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = `
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        `;
        
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Anima os itens do menu
            navLinksItems.forEach((item, index) => {
                if (item.style.animation) {
                    item.style.animation = '';
                } else {
                    item.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
        
        // Fechar menu ao clicar em um link
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                navLinksItems.forEach(item => {
                    item.style.animation = '';
                });
            });
        });
    }
    
    // Suavizar rolagem para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Se for um link de âncora (começa com #)
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Ajuste para a altura do cabeçalho
                        behavior: 'smooth'
                    });
                    
                    // Fechar o menu mobile se estiver aberto
                    if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                        mobileMenuBtn.click();
                    }
                }
            }
            // Se for um link para outra página, o comportamento padrão já é suficiente
        });
    });
    
    // Adiciona classe 'scrolled' na navbar ao rolar a página
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Verifica a posição inicial da página
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Anima os elementos ao carregar a página
    animateOnScroll();
    
    // Anima os elementos ao rolar a página
    window.addEventListener('scroll', animateOnScroll);
    
    // Adiciona efeito de clique nos botões
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Adiciona efeito 3D nos cards ao passar o mouse
    const cards = document.querySelectorAll('.idea-card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 20;
            const angleY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
    
    // Validação do formulário
    const form = document.getElementById('idea-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação básica
            const title = document.getElementById('idea-title');
            const category = document.getElementById('idea-category');
            const location = document.getElementById('idea-location');
            const description = document.getElementById('idea-description');
            
            let isValid = true;
            
            // Resetar mensagens de erro
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Validar título
            if (!title.value.trim()) {
                showError(title, 'Por favor, insira um título para sua ideia');
                isValid = false;
            }
            
            // Validar categoria
            if (!category.value) {
                showError(category, 'Por favor, selecione uma categoria');
                isValid = false;
            }
            
            // Validar localização
            if (!location.value.trim()) {
                showError(location, 'Por favor, informe a localização');
                isValid = false;
            }
            
            // Validar descrição
            if (!description.value.trim()) {
                showError(description, 'Por favor, descreva sua ideia');
                isValid = false;
            }
            
            if (isValid) {
                // Aqui você pode adicionar o código para enviar o formulário
                alert('Ideia enviada com sucesso! Em breve nossa equipe irá analisá-la.');
                form.reset();
                
                // Limpar pré-visualização de imagens
                const imagePreview = document.getElementById('image-preview');
                if (imagePreview) {
                    imagePreview.innerHTML = '';
                }
            }
        });
        
        // Função para exibir mensagens de erro
        function showError(input, message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = 'var(--danger)';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '0.3rem';
            errorElement.textContent = message;
            
            input.classList.add('error');
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        // Preview de imagens
        const imageInput = document.getElementById('idea-images');
        const imagePreview = document.getElementById('image-preview');
        
        if (imageInput && imagePreview) {
            imageInput.addEventListener('change', function() {
                imagePreview.innerHTML = ''; // Limpar pré-visualizações anteriores
                
                const files = this.files;
                if (files.length > 5) {
                    alert('Você pode enviar no máximo 5 imagens');
                    this.value = '';
                    return;
                }
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    // Verificar se o arquivo é uma imagem
                    if (!file.type.match('image.*')) {
                        continue;
                    }
                    
                    // Verificar tamanho do arquivo (máx. 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        alert(`A imagem ${file.name} é muito grande. O tamanho máximo permitido é 5MB.`);
                        continue;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const preview = document.createElement('div');
                        preview.className = 'image-preview-item';
                        preview.innerHTML = `
                            <img src="${e.target.result}" alt="Pré-visualização">
                            <button type="button" class="remove-image">&times;</button>
                        `;
                        
                        // Remover imagem
                        const removeBtn = preview.querySelector('.remove-image');
                        removeBtn.addEventListener('click', function() {
                            preview.remove();
                            // Remover o arquivo do input
                            const newFiles = Array.from(imageInput.files).filter((_, index) => index !== i);
                            const dataTransfer = new DataTransfer();
                            newFiles.forEach(file => dataTransfer.items.add(file));
                            imageInput.files = dataTransfer.files;
                        });
                        
                        imagePreview.appendChild(preview);
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    // Botão de localização
    const findMeBtn = document.getElementById('find-me');
    const locationInput = document.getElementById('idea-location');
    
    if (findMeBtn && locationInput) {
        findMeBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert('Geolocalização não é suportada pelo seu navegador');
                return;
            }
            
            findMeBtn.disabled = true;
            findMeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // Usar a API de Geocodificação para obter o endereço a partir das coordenadas
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(response => response.json())
                        .then(data => {
                            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                            locationInput.value = address;
                        })
                        .catch(() => {
                            locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        })
                        .finally(() => {
                            findMeBtn.disabled = false;
                            findMeBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                        });
                },
                function(error) {
                    let errorMessage = 'Erro ao obter localização';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permissão de localização negada';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informações de localização indisponíveis';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Tempo de espera da localização expirado';
                            break;
                    }
                    alert(errorMessage);
                    findMeBtn.disabled = false;
                    findMeBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                }
            );
        });
    }
});

// Adicionar classe ao header ao rolar a página
window.addEventListener('scroll', function() {
    const header = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
