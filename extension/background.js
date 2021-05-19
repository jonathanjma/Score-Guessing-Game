// default test filter
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({'filter': 'April 27'})
})