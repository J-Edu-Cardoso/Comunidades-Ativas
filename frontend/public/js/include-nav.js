/**
 * Inclui o cabeçalho em todas as páginas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cria o container do cabeçalho
    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';
    
    // Insere o container no início do body
    document.body.insertBefore(headerContainer, document.body.firstChild);
    
    // Obtém o caminho base do site
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    const headerPath = basePath ? `${basePath}/header.html` : 'header.html';
    
    // Carrega o conteúdo do cabeçalho
    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            headerContainer.innerHTML = html;
            // Inicializa a navegação
            initNavigation();
        })
        .catch(error => {
            console.error('Erro ao carregar o cabeçalho:', error);
            // Tenta carregar com caminho relativo em caso de erro
            if (headerPath !== 'header.html') {
                fetch('header.html')
                    .then(response => response.text())
                    .then(html => {
                        headerContainer.innerHTML = html;
                        initNavigation();
                    })
                    .catch(err => console.error('Erro ao carregar o cabeçalho (segunda tentativa):', err));
            }
        });
        
    // Função para inicializar a navegação
    function initNavigation() {
        // Verifica se o usuário está logado
        const isLoggedIn = window.auth ? window.auth.isAuthenticated() : false;
        const userMenu = document.querySelector('.user-menu');
        const authButtons = document.querySelector('.auth-buttons');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        // Atualiza a navegação com base no estado de autenticação
        updateAuthUI(isLoggedIn);
        
        // Configura os eventos de clique nos links de navegação
        setupNavigationLinks();
        
        // Configura o botão de logout
        setupLogoutButton();
        
        // Atualiza o link ativo na navegação
        updateActiveLink(currentPath);
        
        // Configura o menu mobile
        setupMobileMenu();
        
        // Função para atualizar a UI com base no estado de autenticação
        function updateAuthUI(loggedIn) {
            if (loggedIn) {
                // Mostra o menu do usuário e esconde os botões de autenticação
                if (userMenu) userMenu.style.display = 'flex';
                if (authButtons) authButtons.style.display = 'none';
                
                // Atualiza o nome do usuário no menu
                const userName = document.querySelector('.user-name');
                if (userName && window.auth) {
                    const userData = window.auth.getUserData();
                    if (userData && userData.name) {
                        userName.textContent = userData.name.split(' ')[0]; // Mostra apenas o primeiro nome
                    }
                }
            } else {
                // Mostra os botões de autenticação e esconde o menu do usuário
                if (userMenu) userMenu.style.display = 'none';
                if (authButtons) authButtons.style.display = 'flex';
            }
        }
        
        // Função para configurar os eventos de clique nos links de navegação
        function setupNavigationLinks() {
            const navLinks = document.querySelectorAll('nav a, .nav-link');
            navLinks.forEach(link => {
                // Evita recarregar a página ao clicar em links internos
                if (link.getAttribute('href') && !link.getAttribute('href').startsWith('http')) {
                    link.addEventListener('click', function(e) {
                        // Se for um link para uma página de autenticação e o usuário já estiver autenticado
                        if ((this.getAttribute('href').includes('login.html') || 
                             this.getAttribute('href').includes('register.html')) && 
                            isLoggedIn) {
                            e.preventDefault();
                            window.location.href = 'Profile.html';
                        }
                        // Outros comportamentos de navegação podem ser adicionados aqui
                    });
                }
            });
        }
        
        // Função para configurar o botão de logout
        function setupLogoutButton() {
            const logoutButton = document.querySelector('.logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.auth) {
                        window.auth.logout();
                        window.location.href = 'index.html';
                    }
                });
            }
        }
        
        // Função para atualizar o link ativo na navegação
        function updateActiveLink(currentPath) {
            const navLinks = document.querySelectorAll('nav a, .nav-link');
            navLinks.forEach(link => {
                const linkPath = link.getAttribute('href');
                if (linkPath && (linkPath === currentPath || 
                    (linkPath === 'index.html' && (currentPath === '' || currentPath === 'index.html')))) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Função para configurar o menu mobile
        function setupMobileMenu() {
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            const navMenu = document.querySelector('nav ul, .nav-menu');
            
            if (mobileMenuButton && navMenu) {
                mobileMenuButton.addEventListener('click', function() {
                    navMenu.classList.toggle('active');
                    this.classList.toggle('active');
                });
                
                // Fechar o menu ao clicar em um link
                const navItems = navMenu.querySelectorAll('a');
                navItems.forEach(item => {
                    item.addEventListener('click', () => {
                        navMenu.classList.remove('active');
                        mobileMenuButton.classList.remove('active');
                    });
                });
            }
        }
        
        if (userMenu && authButtons) {
            userMenu.style.display = isLoggedIn ? 'block' : 'none';
            authButtons.style.display = isLoggedIn ? 'none' : 'flex';
        }
        
        // Adiciona evento de clique para o menu mobile
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
                mobileMenuBtn.setAttribute('aria-expanded', 
                    mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
                );
            });
        }
        
        // Fecha o menu ao clicar em um link
        document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});
