document.getElementById('save').addEventListener('click', saveFilter)

chrome.storage.local.get(['filter'], function(fromStorage) {
    document.getElementById('filter').value = fromStorage.filter
})

function saveFilter() {
    let filterIn = document.getElementById("filter").value;
    chrome.storage.local.set({'filter': filterIn});
}