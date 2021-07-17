// hmm page not hidden fast enough
// does not work with referrers/arguments in url (when linked clicked on other page)

// hide page
Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function(value) {
    value.classList.add("hide");
});
console.log("hiding page")

// determine mode
class Enum {
    constructor(...keys) {
        keys.forEach((key, i) => {
            this[key] = i;
        });
        Object.freeze(this);
    }

    *[Symbol.iterator]() {
        for (let key of Object.keys(this)) yield key;
    }
}
const modesEnum = new Enum('sat', 'psat', 'ap');

let mode, modeName
let test_filter
new Promise(function(resolve, reject) {
    if (location.href.toLowerCase().includes('ap')) {
        resolve(modesEnum['ap'])
    } else {
        chrome.storage.local.get(['satOverPsat'], function(fromStorage) {
            resolve(fromStorage['satOverPsat'] ? modesEnum['sat'] : modesEnum['psat'])
        })
    }
}).then(value =>  {
    mode = value
    modeName = Object.keys(modesEnum).find(key => modesEnum[key] === mode)
    console.log(mode)
    console.log(modeName)

    // get test filter
    return new Promise(function(resolve, reject) {
        if (mode === modesEnum['ap']) {
            chrome.storage.local.get(['ap'], function (fromStorage) {
                resolve(JSON.parse(fromStorage['ap']))
            })
        } else {
            chrome.storage.local.get(['sat'], function (fromStorage) {
                resolve(fromStorage['sat'])
            })
        }
    })
}).then((value) => {
    test_filter = value
    console.log(test_filter)

    // inject game html and style
    return fetch(chrome.runtime.getURL('/game/content.css')).then(r => r.text()).then(css => {
        css = '<style>' + css + '</style>'
        document.head.insertAdjacentHTML('beforeend', css);
    })
}).then(() => {
    return fetch(chrome.runtime.getURL('/game/' + modeName + '_game.html')).then(r => r.text()).then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);

        let filter_text = ""
        if (mode === modesEnum['ap']) {
            for (let test of test_filter) {
                filter_text += test + " "
            }
        } else {
            filter_text = test_filter
        }
        document.getElementById("filter").innerHTML += filter_text
        document.getElementById("mode").innerHTML += modeName.toUpperCase()

        let icon = document.getElementById("icon")
        icon.src = chrome.extension.getURL("icon.png")
        icon.addEventListener('click', giveUp)
    })
}).then(() => {
    console.log("injecting game")

    // delay to make sure everything loads
    console.log("hi, entering page load delay.....")
    let start = Date.now()
    checkElement(modeName === 'ap' ? '#scoresListArea' : '.scores-container').then((div) => {
        console.log(div);
        console.log("delay done")
        console.log("waited " + (Date.now() - start) + " ms for page load")

        if (modeName === 'ap') {
            ap_action(div)
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
        let scores = test_div.getElementsByClassName("score")
        console.log(scores)
        curScore = scores[0].innerHTML
        let reading_score = scores[1].innerHTML
        let math_score = scores[2].innerHTML
        console.log("Scores: " + curScore + " " + reading_score + " " + math_score)

        // enable game buttons
        let game_buttons = document.getElementsByClassName("gbtn")
        for (let button of game_buttons) {
            button.addEventListener("click", () => {
                processClick(button.innerHTML)
            })
        }
        setStatus("Pick a Number!")
    } catch (e) {
        setStatus("Error, check test filter and reload")
        console.log("error, could not locate scores")
        console.log(e)
    }
}

let score_dict = []
let index = 0, curTest
function ap_action(years_div) {

    try {
        let tests_div = years_div.children[0].children[1]
        for (let test of tests_div.children) {
            console.log(test)
            let test_name = test.children[0].children[0].innerHTML
            let test_score = test.children[1].children[0].children[0].innerHTML

            console.log(test_name)
            console.log(test_score)
            if (test_filter.includes(test_name)) {
                score_dict.push({test: test_name, score: parseInt(test_score)})
            }
        }
        console.log(score_dict)

        // enable game buttons
        let game_buttons = document.getElementsByClassName("gbtn")
        for (let button of game_buttons) {
            button.addEventListener("click", () => {
                processClick(button.innerHTML)
            })
        }

        nextTest()

    } catch (e) {
        setStatus("Error, check test filter and reload")
        console.log("error, could not locate scores")
        console.log(e)
    }
}

function nextTest() {
    curTest = score_dict[index]["test"]
    curScore = score_dict[index]["score"]
    console.log(curTest + " " + curScore)

    document.getElementById("test").innerHTML = curTest
    setStatus("Pick a Number!")

    index++
}

// called when guessing buttons are pressed
function processClick(guess) {
    console.log("Guess: " + guess)

    if (mode !== modesEnum['ap']) {
        if (guess.indexOf("&lt;") !== -1 && curScore < (mode === modesEnum['sat'] ? 1450 : 1370)) {
            guess = curScore;
        } else if (guess.indexOf("&lt;") !== -1) {
            guess = mode === modesEnum['sat'] ? 1440 : 1360
        }
    }

    if (guess > curScore) {
        setStatus("Too high!")
    } else if (guess < curScore) {
        setStatus("Too low!")
    } else {
        setStatus("You guessed it!")
        sleep(1500).then(() => {
            if (index !== score_dict.length) {
                nextTest()
            } else {
                document.getElementById("game").remove()
                Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function(value) {
                    value.classList.remove("hide");
                });
                console.log("game done, unhiding page :-)")
            }
        })
    }
}

// give up
function giveUp() {
    if (confirm("Are you sure you want to give up?")) {
        document.getElementById("game").remove()

        Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function(value) {
            value.classList.remove("hide");
        });
        console.log("user gave up, unhiding page :-(")
    }
}

// set status text
function setStatus(text) {
    document.getElementById("status").innerHTML = text
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
    return document.querySelector(selector);
};