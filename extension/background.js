// default settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({'satEnabled': true})
    chrome.storage.local.set({'apEnabled': true})

    chrome.storage.local.set({'sat': 'August'})
    chrome.storage.local.set({'satOverPsat': true})
    chrome.storage.local.set({'ap': "[\"Computer Science A\"]"})
})

// fix extension not deploying when back button clicked, or on button clicks on the cb website
let urls = ['https://studentscores.collegeboard.org/viewscore', 'https://apstudents.collegeboard.org/view-scores',
    'https://apstudents.collegeboard.org/view-scores/']
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(tab.url)
    if (changeInfo.status === 'loading' && urls.includes(tab.url)) {
        console.log('hi!!!')
        chrome.tabs.executeScript({
            file: 'game/content.js'
        })
    }
})