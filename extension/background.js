// default settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({'satEnabled': true})
    // chrome.storage.local.set({'actEnabled': ''})
    chrome.storage.local.set({'apEnabled': true})

    chrome.storage.local.set({'sat': 'April'})
    chrome.storage.local.set({'satOverPsat': true})
    // chrome.storage.local.set({'act': ''})
    chrome.storage.local.set({'ap': "[\"Computer Science A\"]"})
})