const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listType = document.querySelector('.listType')
const MOVIES_PER_PAGE = 12


const movies = []
//儲存favorite的data
let movies_favorite = JSON.parse(localStorage.getItem('favoriteMovies')) || []
let filterMovies = [] //儲存符合篩選條件的項目
let renderType = "CARD" //儲存當前渲染型態
let renderPage = 1 //儲存當前頁數

//將API資料存入
axios.get(INDEX_URL).then((response) => {
  //法1 將data陣列放入movies
  movies.push(...response.data.results)
  /*法2
  for (const movie of response.data.results) {
    movies.push(movie)
  }*/
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
  showPaginatorPage(1)
})

//function check data on [movies_favorite]
function checkDataOnFavorite(data) {
  //判斷movie data 是否已在movies_favorite
  const check = movies_favorite.find(movie => movie.id === data.id)

  return check ? 'fas fa-star fa-lg btn-remove-like' : 'far fa-star fa-lg btn-add-like'
}

//function 渲染Movie List BY CARD
function renderMovieList(data) {
  let rawHTML = ``
  //processes
  data.forEach(movie => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card" style="width: 16rem;">
            <img
              src="${POSTER_URL + movie.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${movie.id}">More</button>
              <i class="${checkDataOnFavorite(movie)}" data-id="${movie.id}"></i>
            </div>
         </div>
        </div>
      </div>
    `
  });
  renderData = movies
  renderType = "CARD"
  dataPanel.innerHTML = rawHTML
}

//function 渲染Movie List BY LIST
function renderMovieListByList(data) {
  let rawHTML = ``
  //processes
  data.forEach(movie => {
    rawHTML += `
      <div class="col-12 d-flex justify-content-between border-bottom border-success p-2 align-items-center my-2">
        <h3>${movie.title}</h3>
        <div class="">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
          data-id="${movie.id}">More</button>
          <i class="${checkDataOnFavorite(movie)}" data-id="${movie.id}"></i>
        </div>
      </div>
    `
  });
  renderData = movies
  renderType = "LIST"
  dataPanel.innerHTML = rawHTML
}

//function 渲染分頁數量
function renderPaginator(amount) {
  const NumberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ``
  for (let page = 1; page <= NumberOfPages; page++) {
    rawHTML += `
      <li class="page-item "><a class="page-link"  href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

//function update User Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.src = `<img src="${POSTER_URL + data.image}" alt="">`
  })
}

//function add user data to localStorage
function addToFavorite(id) {
  // const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  const movie = movies.find(movie => movie.id === id)
  /* 法二
  movies.forEach(movie => {
    if (movie1.id === id) {
      console.log(movie1)
    }
  })*/
  /*法三
  const movie = movies.filter(movie => movie.id === id)
  */

  //  //排除重複加入的情況
  //   if (movies_favorite.some(movie => movie.id === id)) {
  //     return alert('以電影已經收藏在清單中!')
  //   }

  movies_favorite.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies_favorite))
}

//function 取得分頁渲染的資料
function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//function remove data from localStorage
function removeFromFavorite(id) {
  //如果沒資料就結束
  if (!movies_favorite) return
  //透過 id 找到要刪除電影的 index
  const movieIndex = movies_favorite.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return
  //刪除該筆電影
  movies_favorite.splice(movieIndex, 1)
  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies_favorite))
}

//function active當前page
function showPaginatorPage(page) {
  let renderData = filterMovies.length ? filterMovies : movies
  renderPaginator(renderData.length)
  paginator.children[page - 1].classList.add("active")
}

//set EventListener on dataPanel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-like')) {
    addToFavorite(Number(event.target.dataset.id))
    event.target.classList = 'fas fa-star fa-lg btn-remove-like'
  } else if (event.target.matches('.btn-remove-like')) {
    removeFromFavorite(Number(event.target.dataset.id))
    event.target.classList = 'far fa-star fa-lg btn-add-like'
  }
})

// 搜尋功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //條件篩選(一)
  filterMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )
  //條件篩選(二)
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filterMovies.push(movie)
  //   }
  // }

  //錯誤處理：無符合條件的結果
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //儲存當前渲染資料[movies]
  renderData = filterMovies
  //重製分頁器
  renderPaginator(filterMovies.length)
  //預設顯示第 1 頁的搜尋結果
  showPaginatorPage(1)
  if (renderType === "CARD") {
    renderMovieList(getMoviesByPage(1))
  } else if (renderType === "LIST") {
    renderMovieListByList(getMoviesByPage(1))
  }
})

//點擊分頁鈕渲染畫面
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  const page = Number(event.target.dataset.page)
  renderPage = page
  //判斷renderType 型態去渲染資料
  if (renderType === "CARD") {
    renderMovieList(getMoviesByPage(page))
  } else if (renderType === "LIST") {
    renderMovieListByList(getMoviesByPage(page))
  }
  //active當前page
  showPaginatorPage(page)
})

//變換card及list渲染模式
listType.addEventListener("click", function changeListType(event) {
  page = filterMovies.length ? Number(1) : renderPage
  if (event.target.dataset.type === "listType") {
    return renderMovieListByList(getMoviesByPage(page))
  }
  if (event.target.dataset.type === "cardType") {
    return renderMovieList(getMoviesByPage(page))
  }
})


