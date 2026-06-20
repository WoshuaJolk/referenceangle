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

function renderItems(dataArray) {
    let container = $('#dataContainer');
    if ($('img.pose').length < 1) {
        for (let item of dataArray) {
            container.append(generateTemplate(item));
        }
    } else {
        if (dataArray.length > 0) {
            $('img.pose').each(function (i) {
                if (dataArray[i]) {
                    const $img = $(this);
                    $img.attr('src', '/images/giphy.gif');
                    let delay = Math.random();
                    setTimeout(() => {
                           $img.attr('src', dataArray[i].src);
                        $img.closest('a').attr('href', dataArray[i].src)
                       }, delay);
                }
            });
        } else {
            container.empty();
        }
    }
}

function initiatePagination() {
    $('#mainPaginationContainer').pagination({
        dataSource: globalDataList,
        locator: 'data',
        className: 'paginationjs-theme-green',
        pageSize: 12,
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
