const API_ENDPOINT = '/api/tmdb';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

const heroSection = document.getElementById('hero-section');
const gridContainer = document.getElementById('top-movies-grid');
const categoryContainer = document.getElementById('movie-categories-grid'); 
const upcomingGrid = document.getElementById('upcoming-movies-grid');
const modal = document.getElementById('modal');
const searchInput = document.getElementById('search-input');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const logo = document.getElementById('logo');
const categoryBtn = document.querySelectorAll('.category-btn');
let isSearchActive = false;




//function to call API
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        endpoint,
        ...params
    });
    
    const response = await fetch(`${API_ENDPOINT}?${queryParams}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
}


//function to show loading state
function showLoadingState(container, type = 'grid') {
    if (type === 'grid') {
        container.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-20">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
            </div>
        `;
    } else if (type === 'cards') {
        // Skeleton cards
        const skeletons = Array(5).fill(null).map(() => `
            <div class="flex flex-col gap-2 animate-pulse">
                <div class="bg-gray-700 rounded-lg aspect-[2/3]"></div>
                <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
        `).join('');
        container.innerHTML = skeletons;
    } else if (type === 'hero') {
        container.innerHTML = `
            <div class="absolute inset-0 bg-gray-800 animate-pulse">
                <div class="relative z-10 p-10 flex flex-col justify-end h-full max-w-4xl">
                    <div class="h-12 bg-gray-700 rounded w-2/3 mb-4"></div>
                    <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    <div class="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>
                    <div class="flex gap-4">
                        <div class="h-12 bg-gray-700 rounded w-32"></div>
                        <div class="h-12 bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to fetch trending movies
async function getTrendingMovies() {
    showLoadingState(heroSection, 'hero');
    showLoadingState(gridContainer, 'cards');
    try {
        const data = await fetchFromTMDB('trending/movie/day', {
            language: 'en-US',
            page: '1'
        });

        const movies = data.results;
        const heroMovie = movies[0];
        updateHero(heroMovie);


        const topFive = movies.slice(1, 6);
        renderMovieCards(topFive, gridContainer);

        console.log(data.results);
        return data.results;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
    }
}

function updateHero(movie) {
    const backdropUrl = `${IMG_BASE_URL}/original${movie.backdrop_path}`;
    
    // Creating the Hero HTML structure
    heroSection.innerHTML = `
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${backdropUrl}')">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div class="relative z-10 p-10 flex flex-col justify-end h-full max-w-4xl">
            <h1 class="text-5xl font-extrabold text-text mb-4">${movie.title}</h1>
            <p class="text-text text-lg line-clamp-3 mb-6">${movie.overview}</p>
            <div class="flex gap-4">
                <button class="bg-accent hover:bg-secondary text-white px-8 py-3 rounded font-bold transition cursor-pointer">Play Trailer</button>
                <button class="bg-secondary hover:bg-accent text-white px-8 py-3 rounded font-bold transition border border-gray-600 cursor-pointer">More Info</button>
            </div>
        </div>
    `;
}

function renderMovieCards(movies, container) {
    container.innerHTML = ''; 

    movies.forEach(movie => {
        const posterUrl = movie.poster_path 
            ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
            : 'https://placehold.co/500x750?text=No+Image';

        const card = document.createElement('div');

        card.className = 'flex flex-col gap-2 group cursor-pointer';

        card.innerHTML = `
            <div class="relative overflow-hidden rounded-lg bg-gray-800">
                <img src="${posterUrl}" alt="${movie.title}" loading="lazy" decoding="async"
                     class="w-full h-auto object-cover transform group-hover:scale-105 transition duration-300 aspect-[2/3]">
                
                ${movie.vote_average ? `
                    <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                        <span class="text-yellow-400">⭐</span>
                        <span class="text-white text-sm font-semibold">${movie.vote_average.toFixed(1)}</span>
                    </div>
                ` : ''}     
            </div>
            <h3 class="text-white font-semibold truncate mt-2">${movie.title}</h3>
            <span class="text-gray-400 text-sm">
                ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
            </span>
        `;
        card.addEventListener('click', () => {
            console.log("Clicked:", movie.title); 
            handleMovieClick(movie.id); 
        });

        container.appendChild(card);
    });
}

//function to fetch popular movies for "ALL" category
async function getPopularMovies() {
    showLoadingState(categoryContainer, 'cards');

    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`
        );
        const data = await response.json();
        const movies = data.results;

        const topTen = movies.slice(0, 10);
        renderMovieCards(topTen, categoryContainer);
        console.log(data.results);
        return data.results;
    }
    catch (error) {
        console.error("Error fetching popular movies:", error);
    }   
}

// Fetch movies by genre category
async function getMovieCategory(id) {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${id}&language=en-US&page=1`
        )
        const data = await response.json();
        const movies = data.results;
        console.log(data.results);

        const topTen = movies.slice(0, 10);
        renderMovieCards(topTen, categoryContainer);
    }
    catch (error) {
        console.error("Error fetching movie categories:", error);
    }
}



//click handler with active state management
categoryBtn.forEach(button => {
    button.addEventListener('click', () => {
        categoryBtn.forEach(btn => {
            btn.classList.remove('bg-accent');
            btn.classList.add('bg-secondary');
        });
        
        // Add active state to clicked button
        button.classList.remove('bg-secondary');
        button.classList.add('bg-accent');
        
        const categoryId = button.getAttribute('data-id');
        
        // Handling "ALL" button separately
        if (!categoryId) {
            // This is the "ALL" button (no data-id)
            console.log('Fetching all popular movies');
            getPopularMovies();
        } else {
            // This is a specific genre button
            console.log(`Category ID: ${categoryId}`);
            getMovieCategory(categoryId);
        }
    });
});



//function to fetch upcoming Movies.
async function getUpcomingMovies() {
    showLoadingState(upcomingGrid, 'cards');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = tomorrow.toISOString().split('T')[0];
    const url = `${BASE_URL}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${dateStr}`;
    try {
        const response = await fetch(url);
        const data = await response.json();


        const movies = data.results;
        console.log(movies);

        const topFive = movies.slice(0, 5);
        renderMovieCards(topFive, upcomingGrid);
    }
    catch(error) {
        console.error("Error fetching upcoming movies:", error);
    } 
}



mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('hidden');

    const icon = mobileMenuBtn.querySelector('svg path');
        if (mobileMenu.classList.contains('hidden')) {
           icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        } else {
           icon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    }
 });

 //Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && 
        !mobileMenu.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        // Reset icon
        const icon = mobileMenuBtn.querySelector('svg path');
        icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
});
//Close menu when search is performed
searchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const query = searchInput.value.trim();
        if(query) {
            searchMovies(query);
            searchInput.value = '';
            
            // Close mobile menu if open
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('svg path');
            icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }
    }
});



searchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const query = searchInput.value.trim();
        if(query) {
            searchMovies(query);
            searchInput.value = '';
        }
    }
});

async function searchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length > 0) {
            isSearchActive = true;

            heroSection.classList.add('hidden');
            document.querySelector('section:has(#movie-categories-grid)').classList.add('hidden');
            document.querySelector('section:has(#upcoming-movies-grid)').classList.add('hidden');
        
                const sectionTitle = document.getElementById('hero-h2'); 
                sectionTitle.innerHTML = `
                    Search Results for "${query}"
                    <button id="clear-search"
                        class="ml-4 text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition">
                        x Clear Search
                    </button>
                    `;
            document.getElementById('clear-search').addEventListener('click', clearSearch);  
            
            const sortedMovies = data.results.sort((a, b) => b.popularity - a.popularity);
            renderMovieCards(sortedMovies, gridContainer);


        } else {
            isSearchActive = true;
            heroSection.classList.add('hidden');
            document.querySelector('section:has(#movie-categories-grid)').classList.add('hidden');
            document.querySelector('section:has(#upcoming-movies-grid)').classList.add('hidden');
            
            const gridContainer = document.getElementById('top-movies-grid');
            gridContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-400 text-xl mb-4">No movies found for "${query}"</p>
                    <button onclick="clearSearch()" 
                        class="bg-accent hover:bg-secondary px-6 py-3 rounded transition">
                        Try Another Search
                    </button>
                </div>
            `;
        }


    } catch (error) {
        gridContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-400 text-xl mb-4">No movies found for "${query}"</p>
                    <button onclick="clearSearch()" 
                        class="bg-accent hover:bg-secondary px-6 py-3 rounded transition">
                        Try Another Search
                    </button>
                </div>
            `;
    }
}


function clearSearch() {
    isSearchActive = false;
    
  
    heroSection.classList.remove('hidden');
    document.querySelector('section:has(#movie-categories-grid)').classList.remove('hidden');
    document.querySelector('section:has(#upcoming-movies-grid)').classList.remove('hidden');
    
   
    document.getElementById('hero-h2').textContent = 'Trending Now';
    
 
    getTrendingMovies();
    
    searchInput.value = '';
}





logo.addEventListener('click', () => {
    if (isSearchActive) {
        clearSearch();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
});














async function getMovieData(movieID) {
    const modal = document.getElementById('modal');
    const movieDetail = document.getElementById('movie-detail');

    modal.classList.remove('hidden');
    movieDetail.innerHTML = `
        <div class="flex items-center justify-center p-20">
            <div class="text-white text-xl">Loading...</div>
        </div>
    `;

    try {
        const endpoints = [
            `${BASE_URL}/movie/${movieID}?api_key=${apiKey}`,
            `${BASE_URL}/movie/${movieID}/videos?api_key=${apiKey}`,
            `${BASE_URL}/movie/${movieID}/watch/providers?api_key=${apiKey}`,
            `${BASE_URL}/movie/${movieID}/credits?api_key=${apiKey}`
        ];

        const responses = await Promise.all(
            endpoints.map(url => fetch(url))
        );

        const [details, videos, providers, credits] =
            await Promise.all(responses.map(res => res.json()));

        const rating = details.vote_average.toFixed(1);

        const genres = details.genres
            .map(g => g.name)
            .join(', ');

        const trailer = videos.results.find(
            v => v.site === 'YouTube' && v.type === 'Trailer'
        );

        const trailerLink = trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : null;

        const usProviders = providers.results?.US?.flatrate || [];

        const providerNames = usProviders.length
            ? usProviders.map(p => p.provider_name).join(', ')
            : 'Not streaming currently';

        const topCast = credits.cast.slice(0, 5).map(actor => ({
            name: actor.name,
            character: actor.character,
            image: actor.profile_path
                ? `${IMG_BASE_URL}/w185${actor.profile_path}`
                : 'https://via.placeholder.com/100'
        }));

        renderMovieModal({
            title: details.title,
            overview: details.overview, 
            poster: `${IMG_BASE_URL}/w500${details.poster_path}`,
            rating,
            genres,
            providerNames,
            trailerLink,
            topCast
        });

    } catch (error) {
        console.error("Error fetching data:", error);
         movieDetail.innerHTML = `
            <div class="relative p-8 bg-gray-900 rounded-lg">
                <button id="close-overlay" 
                    class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                    ✕ Close
                </button>
                <div class="text-center pt-8">
                    <p class="text-red-400 text-xl mb-4">⚠️ Failed to load movie details</p>
                    <p class="text-gray-400">Please try again later</p>
                </div>
            </div>
        `;
};
}



function renderMovieModal(movie) {
    const modal = document.getElementById('modal');
    const movieDetail = document.getElementById('movie-detail');

    modal.classList.remove('hidden');

    movieDetail.innerHTML = `
        <div class="relative max-h-[90vh] w-full overflow-y-auto">
            <button id="close-overlay" class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg z-10 transition cursor-pointer">
                x Close
            </button>
            
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" decoding="async"  class="w-full rounded-t-lg">
            
            <div class="p-6 bg-gray-900 text-white rounded-b-lg">
                <h2 class="text-2xl font-bold mb-4">${movie.title}</h2>
                
                ${movie.overview ? `<p class="text-gray-300 mb-4 leading-relaxed">${movie.overview}</p>` : ''}
                
                <div class="space-y-3 mb-6">
                    <p><strong class="text-yellow-400">⭐ Rating:</strong> ${movie.rating} / 10</p>
                    <p><strong class="text-purple-400">🎭 Genres:</strong> ${movie.genres}</p>
                    <p><strong class="text-blue-400">📺 Watch on (US):</strong> ${movie.providerNames}</p>
                    ${movie.trailerLink ? `
                        <p>
                            <strong class="text-red-400">🎥 Trailer:</strong>
                            <a href="${movie.trailerLink}" target="_blank" class="text-blue-400 hover:underline ml-2">
                                Watch on YouTube
                            </a>
                        </p>
                    ` : '<p><strong class="text-red-400">🎥 Trailer:</strong> Not available</p>'}
                </div>

                <h3 class="text-xl font-bold mb-4 text-white">Top Cast:</h3>
                <div class="grid grid-cols-1 gap-4">
                    ${movie.topCast.map(actor => `
                        <div class="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                            <img src="${actor.image}" alt="${actor.name}" loading="lazy" class="w-16 h-16 rounded-full object-cover">
                            <div>
                                <p class="font-semibold text-white">${actor.name}</p>
                                <p class="text-sm text-gray-400">${actor.character}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}


function handleMovieClick(movieID) {
    getMovieData(movieID);
}
// Attach modal close logic ONCE
modal.addEventListener('click', (e) => {
    // Close if clicking the backdrop or close button
    if (e.target.id === 'close-overlay' || 
        e.target.id === 'modal-backdrop' || 
        e.target.id === 'modal') {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});







//Initialize with popular movies on page load


document.addEventListener('DOMContentLoaded', () => {
    getTrendingMovies();
    getPopularMovies();
    getUpcomingMovies();

    const allButton = document.querySelector('.category-btn:not([data-id])');
    if (allButton) {
        allButton.classList.remove('bg-secondary');
        allButton.classList.add('bg-accent');
    }
});
