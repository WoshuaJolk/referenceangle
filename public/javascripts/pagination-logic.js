var MOBILE_BREAKPOINT = 768;

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

// 4 images (a 2x2 grid) on mobile, 12 on desktop.
function pageSizeForViewport() {
    return isMobile() ? 4 : 12;
}

function generateTemplate(item) {
    return `
            <div class="column">
          <div class="ui segment">
            <a href="${item.src}" target="_blank"  class="ui medium image toPlainImage">
            <img class="pose" src="${item.src}">
            </a>
          </div>
        </div>
      `;
}

// Rebuild the grid from the current page's items. Rebuilding (rather than
// patching existing nodes) keeps the grid correct when the page size changes
// between the mobile and desktop breakpoints.
function renderItems(dataArray) {
    let container = $('#dataContainer');
    container.empty();
    for (let item of dataArray) {
        container.append(generateTemplate(item));
    }
}

function initiatePagination() {
    $('#mainPaginationContainer').pagination({
        dataSource: globalDataList,
        locator: 'data',
        className: 'paginationjs-theme-green',
        pageSize: pageSizeForViewport(),
        callback: function (response, pagination) {
            renderItems(response);
        }
    });
}

initiatePagination();

function destroyPagination() {
    $('#mainPaginationContainer').pagination('destroy');
    initiatePagination()
}

// Re-paginate when crossing the mobile/desktop breakpoint so the page size
// (2x2 vs 4-wide) updates.
var wasMobile = isMobile();
$(window).on('resize', function () {
    var nowMobile = isMobile();
    if (nowMobile !== wasMobile) {
        wasMobile = nowMobile;
        destroyPagination();
    }
});
