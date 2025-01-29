<div id="blog-list" class="page hidden">
<h1 id="blogListTitle"></h1>
<div class="search-container">
<input type="text" id="search-input" placeholder="Search posts..." oninput="debouncedSearchPosts()">
</div>
<div class="content-post">
<div id="posts-container"></div>
<div class="pagination pags">
<button id="prev-page" onclick="changePage(-1)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
</svg> Previous</button> 
<span id="current-page"></span> 
<button id="next-page" onclick="changePage(1)">Next <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
</svg></button>
</div>
</div>
</div>