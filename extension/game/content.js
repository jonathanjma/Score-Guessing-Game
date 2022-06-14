// hide page initially
document.getElementsByTagName('html')[0].setAttribute('hidden', 'true')
console.log('hiding page')

// mode enum definition
class Enum {
    constructor(...keys) {
        keys.forEach((key, i) => {
            this[key] = i
        })
        Object.freeze(this)
    }

    *[Symbol.iterator]() {
        for (let key of Object.keys(this)) yield key
    }
}
const modesEnum = new Enum('sat', 'psat', 'ap')

let mode, modeName
let test_filter

let signin_flag = false

// extension not called when using forward/back buttons?

// determine mode, break if not test score page
new Promise((resolve, reject) => {
    // location.href not always updated (sometimes is prev page url before redirect)?
    console.log(location.href)
    if (location.href === 'https://apstudents.collegeboard.org/view-scores') { // might need '/' at end?
        // if (!location.href.includes('apscore.collegeboard.org/scores/view-your-scores')) {
        //     unHidePage()
        //     reject('Not AP Score page')
        // }
        resolve(modesEnum['ap'])
    } else if (location.href === 'https://studentscores.collegeboard.org/viewscore') {
        chrome.storage.local.get(['satOverPsat'], function(fromStorage) {
            resolve(fromStorage['satOverPsat'] ? modesEnum['sat'] : modesEnum['psat'])
        })
    } else {
        unHidePage()
        reject('Not AP/SAT Score page')
    }
}).then(value =>  {
    mode = value
    modeName = Object.keys(modesEnum).find(key => modesEnum[key] === mode)
    // console.log(mode)
    console.log(modeName)

    // get test filter, break if mode is disabled
    return new Promise((resolve, reject) => {
        if (mode === modesEnum['ap']) {
            chrome.storage.local.get(['apEnabled', 'ap'], function (fromStorage) {
                if (fromStorage['apEnabled']) {
                    resolve(JSON.parse(fromStorage['ap']))
                } else {
                    unHidePage()
                    reject('AP not enabled')
                }
            })

        } else {
            chrome.storage.local.get(['satEnabled', 'sat'], function (fromStorage) {
                if (fromStorage['satEnabled']) {
                    resolve(fromStorage['sat'])
                } else {
                    unHidePage()
                    reject('SAT not enabled')
                }
            })
        }
    })
}).then((value) => {
    test_filter = value
    console.log(test_filter)

    // make sure all other elements are hidden after page loads
    window.addEventListener('load', () => {
        if (modeName === 'ap') {
            checkElement('.cb-user').then(element => {
                signin_flag = element.parentElement.children[0].innerHTML.includes('Sign In')
                console.log(element.parentElement.children[0].innerHTML)
                console.log('FLAG: ' + signin_flag)
                if (signin_flag) {
                    document.getElementById('game').remove()
                    unHidePage()
                }
            })
        }
        hidePage()
        console.log(document.querySelectorAll('body *:not(#game *)').length)
    })

    // make sure body exists before injecting
    return checkElement('body')
}).then(() => {
    // inject game html and css
    return fetch(chrome.runtime.getURL('/game/content.css')).then(r => r.text()).then(css => {
        css = '<style>' + css + '</style>'
        document.head.insertAdjacentHTML('beforeend', css)
    })
}).then(() => {
    return fetch(chrome.runtime.getURL('/game/' + modeName + '_game.html')).then(r => r.text()).then(html => {
        document.body.insertAdjacentHTML('afterbegin', html)

        let filter_text = ''
        if (mode === modesEnum['ap']) {
            for (let test of test_filter) {
                filter_text += test + ', '
            }
            filter_text = filter_text.substring(0, filter_text.length-2)
        } else {
            filter_text = test_filter
        }
        document.getElementById('filter').innerHTML += filter_text
        document.getElementById('mode').innerHTML += modeName.toUpperCase()

        let icon = document.getElementById('icon')
        icon.src = chrome.extension.getURL('icon.png')
        icon.addEventListener('click', giveUp)
    })
}).then(() => {
    console.log('injecting game')

    // make sure test score area has loaded
    checkElement(modeName === 'ap' ? '.apscores-card' : '.scores-container').then((div) => {
        document.getElementsByTagName('html')[0].removeAttribute('hidden')
        hidePage()
        document.getElementById('game').removeAttribute('hidden')

        console.log(document.querySelectorAll('body *:not(#game *)').length)

        console.log(div)
        if (modeName === 'ap') {
            ap_action()
        } else {
            sat_action(div)
        }
    })
})

let curScore
function sat_action(tests_div) {

    // find correct test
    let test_div
    for (let test of tests_div.children) {
        let test_info = test.attributes.getNamedItem('aria-label').textContent
        console.log(test_info)
        console.log(test)
        if (test_info.indexOf(test_filter) !== -1) {
            test_div = test
            break
        }
    }

    try {
        // find scores in test element
        let scores = test_div.getElementsByClassName('score')
        console.log(scores)
        curScore = scores[0].innerHTML
        let reading_score = scores[1].innerHTML
        let math_score = scores[2].innerHTML
        console.log('Scores: ' + curScore + ' ' + reading_score + ' ' + math_score)

        // enable game buttons
        let game_buttons = document.getElementsByClassName('gbtn')
        for (let button of game_buttons) {
            button.addEventListener('click', () => {
                processClick(button.innerHTML)
            })
        }
        setStatus('Pick a Number!')
    } catch (e) {
        setStatus('Error, check test filter and reload')
        console.log('error, could not locate scores')
        console.log(e)
    }
}

let score_dict = []
let index = 0, curTest
function ap_action() {
    // check to make sure all ap tests are valid

    try {
        let all_tests_divs = document.getElementsByClassName('apscores-card')
        for (let test_div of all_tests_divs) {
            console.log(test_div)
            if (!test_div.getAttribute('data-testid').includes('award')) {
                let test_name = test_div.children[0].children[0].innerHTML
                let test_score = test_div.getElementsByClassName('apscores-badge')[0].childNodes[1].nodeValue
                console.log(test_name)
                console.log(test_score)

                test_filter.forEach((item) => {
                    if (('AP ' + item).includes(test_name)) {
                        score_dict.push({test: test_name, score: parseInt(test_score)})
                    }
                })
            }
        }
        console.log(score_dict)

        // enable game buttons
        for (let button of document.getElementsByClassName('gbtn')) {
            button.addEventListener('click', () => {
                processClick(button.innerHTML)
            })
        }

        nextTest()

    } catch (e) {
        setStatus('Error, check test filter and reload')
        console.log('error, could not locate scores')
        console.log(e)
    }
}

function nextTest() {
    curTest = score_dict[index]['test']
    curScore = score_dict[index]['score']
    console.log(curTest + ' ' + curScore)

    document.getElementById('test').innerHTML = curTest
    setStatus('Pick a Number!')

    // remove button focus
    for (let button of document.getElementsByClassName('gbtn')) {
        button.blur()
    }

    index++
}

// called when guessing buttons are pressed
function processClick(guess) {
    console.log('Guess: ' + guess)

    if (mode !== modesEnum['ap']) {
        if (guess.indexOf('&lt;') !== -1 && curScore < (mode === modesEnum['sat'] ? 1450 : 1370)) {
            guess = curScore
        } else if (guess.indexOf('&lt;') !== -1) {
            guess = mode === modesEnum['sat'] ? 1440 : 1360
        }
    }

    if (guess > curScore) {
        setStatus('Too high!')
    } else if (guess < curScore) {
        setStatus('Too low!')
    } else {
        setStatus('You guessed it!')
        sleep(1000).then(() => {
            if (index !== score_dict.length) {
                nextTest()
            } else {
                document.getElementById('game').remove()
                unHidePage()
                console.log('game done, unhiding page :-)')
            }
        })
    }
}

// give up
function giveUp() {
    if (confirm('Are you sure you want to give up?')) {
        document.getElementById('game').remove()
        unHidePage()
        console.log('user gave up, unhiding page :-(')
    }
}

// set status text
function setStatus(text) {
    document.getElementById('status').innerHTML = text
}

// hiding and unhiding original page
function hidePage() {
    Array.prototype.slice.call(document.querySelectorAll('body *:not(#game *)')).forEach(function(value) {
        value.setAttribute('hidden', 'true')
    })
}

function unHidePage() {
    document.getElementsByTagName('html')[0].removeAttribute('hidden')
    Array.prototype.slice.call(document.querySelectorAll('body *')).forEach(function(value) {
        value.removeAttribute('hidden')
    })
}

// sleep
async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

// check if element is present
const checkElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise( resolve => requestAnimationFrame(resolve))
    }
    return document.querySelector(selector)
}