let config = {};
let posts = [];
let filteredPosts = [];
let allTags = new Set();
let currentPage = 1;
let postsPerPage = 5;
let currentPostIndex = 0;

function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

function initApp() {
    fetchData('data/config.json')
        .then(data => {
            config = data;
            postsPerPage = config.postsPerPage;
            document.getElementById('pageTitle').textContent = config.siteName;
            document.getElementById('blogListTitle').textContent = config.blogListTitle;
            document.getElementById('tagListTitle').textContent = config.tagListTitle;
            createNavigation();
            return fetchData('data/blog.json');
        })
        .then(data => {
            posts = data;
            filteredPosts = posts;
            const hash = window.location.hash.substring(1) || 'home';
            handleNavigation(hash);
        })
        .catch(error => {
            console.error('Error initializing app:', error);
        });

    document.getElementById('search-input').addEventListener('input', debouncedSearchPosts);
}

function createNavigation() {
    const nav = document.getElementById('mainNav');
    config.navigation.forEach(item => {
        const link = document.createElement('a');
        link.textContent = item.name;
        link.href = '#' + (item.url === '/' ? 'home' : item.url.substring(1));
        link.onclick = (e) => {
            e.preventDefault();
            handleNavigation(item.url === '/' ? 'home' : item.url.substring(1));
        };
        nav.appendChild(link);
    });
}

function handleNavigation(hash) {
    if (hash.startsWith('blog-post/')) {
        const slug = hash.split('/')[1];
        showPage('blog-post', slug);
    } else if (hash.startsWith('tag-list/')) {
        const tag = hash.split('/')[1];
        showPage('tag-list', tag);
    } else {
        showPage(hash);
    }
}

function showPage(pageId, param = null) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));

    if (pageId === 'home') {
        fetchData('data/home.json')
            .then(data => {
                document.getElementById('home').innerHTML = data.content;
                document.getElementById('home').classList.remove('hidden');
                updateMetaTags(data.title, data.description, data.image);
                updateCanonicalLink('/');
            })
            .catch(error => {
                console.error('Error loading home page:', error);
                document.getElementById('home').innerHTML = '<p>Error loading home page. Please try again later.</p>';
            });
    } else if (pageId === 'blog-list') {
        document.getElementById('blog-list').classList.remove('hidden');
        updateMetaTags(config.blogListTitle, "Explore our collection of insightful blog posts", config.defaultImage);
        updateCanonicalLink('/blog-list');
        resetSearch();
        displayPosts();
    } else if (pageId === 'tag-list') {
        document.getElementById('tag-list').classList.remove('hidden');
        displayTags(param);
        updateCanonicalLink(param ? `/tag-list/${param}` : '/tag-list');
    } else if (pageId === 'blog-post') {
        showPost(param);
    } else {
        // Handle static pages
        fetchData(`data/${pageId}.json`)
            .then(data => {
                document.getElementById('static-title').textContent = data.title;
                document.getElementById('static-content').innerHTML = data.content;
                document.getElementById('static-page').classList.remove('hidden');
                updateMetaTags(data.title, data.description, data.image);
                updateCanonicalLink(`/${pageId}`);
            })
            .catch(error => {
                console.error(`Error loading ${pageId} page:`, error);
                document.getElementById('static-page').innerHTML = `<p>Error loading ${pageId} page. Please try again later.</p>`;
                document.getElementById('static-page').classList.remove('hidden');
            });
    }

    updateHistory(pageId, param);
}

function resetSearch() {
    document.getElementById('search-input').value = '';
    filteredPosts = posts;
    currentPage = 1;
}

function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagePost = filteredPosts.slice(startIndex, endIndex);

    if (pagePost.length === 0) {
        postsContainer.innerHTML = '<p>No posts found.</p>';
    } else {
        pagePost.forEach(post => {
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content.substring(0, 180)}...<br/>
                ${post.tags.map(tag => `<span class="tag" onclick="showPage('tag-list', '${tag}')">#${tag}</span>`).join('')}</p>
                <button class="btn-post" onclick="showPage('blog-post', '${slugify(post.title)}')">Read ${post.title}</button><hr/>
                        `;
            postsContainer.appendChild(postElement);
        });
    }

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const currentPageSpan = document.getElementById('current-page');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    if (totalPages <= 1) {
        document.querySelector('.pagination').classList.add('hidden');
    } else {
        document.querySelector('.pagination').classList.remove('hidden');
    }
}

function displayTags(selectedTag = null) {
    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = '';

    allTags.clear();
    posts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));

    if (selectedTag) {
        filteredPosts = posts.filter(post => post.tags.includes(selectedTag));
        tagsContainer.innerHTML = `
            <h2>Posts tagged with "${selectedTag}"</h2>
            ${filteredPosts.map(post => `
                <div class="content-post">
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 180)}...</p>
                    <button class="stags" onclick="showPage('blog-post', '${slugify(post.title)}')">Read ${post.title}</button>
                </div>
            `).join('')}
        `;
        updateMetaTags(`Posts tagged with "${selectedTag}" - ${config.siteName}`, `Browse posts tagged with ${selectedTag}`, config.defaultImage);
    } else {
        allTags.forEach(tag => {
            const tagElement = document.createElement('span');
            const postCount = posts.filter(post => post.tags.includes(tag)).length;
            tagElement.innerHTML = `
                <button class="stags" onclick="showPage('tag-list', '${tag}')">${tag} (${postCount})</button>
            `;
            tagsContainer.appendChild(tagElement);
        });
        updateMetaTags(config.tagListTitle, "Browse all tags", config.defaultImage);
    }
}

function showPost(slug) {
    const post = posts.find(p => slugify(p.title) === slug);
    if (post) {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-content').innerHTML = post.content;
        document.getElementById('post-tags').innerHTML = post.tags.map(tag => 
            `<span class="tag" onclick="showPage('tag-list', '${tag}')">${tag}</span>`
        ).join('');
        document.getElementById('blog-post').classList.remove('hidden');
        currentPostIndex = posts.findIndex(p => p.id === post.id);
        updatePostNavigation();
        updateMetaTags(`${post.title} - ${config.siteName}`, post.description, post.image || config.defaultImage);
        updateCanonicalLink(`/blog-post/${slug}`);
        updateHistory('blog-post', slug);
    }
}

function navigatePost(direction) {
    currentPostIndex += direction;
    if (currentPostIndex < 0) currentPostIndex = 0;
    if (currentPostIndex >= posts.length) currentPostIndex = posts.length - 1;
    showPage('blog-post', slugify(posts[currentPostIndex].title));
}

function updatePostNavigation() {
    document.getElementById('prev-post').disabled = currentPostIndex === 0;
    document.getElementById('next-post').disabled = currentPostIndex === posts.length - 1;
}

function updateMetaTags(title, description, image = '') {
    const finalImage = image || config.defaultImage;
    document.title = title;
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageDescription').setAttribute('content', description);

    // Update Open Graph tags
    document.getElementById('ogTitle').setAttribute('content', title);
    document.getElementById('ogDescription').setAttribute('content', description);
    document.getElementById('ogSiteName').setAttribute('content', config.siteName);
    document.getElementById('ogImage').setAttribute('content', finalImage);
    document.getElementById('ogImageAlt').setAttribute('content', title);

    // Update Twitter Card tags
    document.getElementById('twitterTitle').setAttribute('content', title);
    document.getElementById('twitterDescription').setAttribute('content', description);
    document.getElementById('twitterImage').setAttribute('content', finalImage);
    document.getElementById('twitterImageAlt').setAttribute('content', title);

    // Update other meta tags
    document.getElementById('metaTitle').setAttribute('content', title);
    document.getElementById('metaDescription').setAttribute('content', description);
}

function updateCanonicalLink(url) {
    document.getElementById('canonicalLink').setAttribute('href', `https://jblog.axcora.com${url}`);
}

function searchPosts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) || 
        post.content.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    currentPage = 1;
    displayPosts();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    currentPage += direction;

    if (currentPage < 1) currentPage = 1
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    displayPosts();
}

function updateHistory(page, param = null) {
    const state = { page: page };
    if (param) state.param = param;
    let url = `#${page}`;
    if (param) {
        if (page === 'blog-post' || page === 'tag-list') {
            url += `/${param}`;
        }
    }
    history.pushState(state, '', url);
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSearchPosts = debounce(searchPosts, 300);

window.onpopstate = function(event) {
    if (event.state) {
        if (event.state.page === 'blog-post') {
            showPage('blog-post', event.state.param);
        } else if (event.state.page === 'tag-list' && event.state.param) {
            showPage('tag-list', event.state.param);
        } else {
            showPage(event.state.page);
        }
    } else {
        showPage('home');
    }
};

window.onload = initApp;



