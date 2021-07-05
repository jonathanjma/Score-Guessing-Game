// hide page
document.getElementById("root").setAttribute("hidden", "true")
console.log("hiding root")

// get test filter
let test_filter
chrome.storage.local.get(['filter'], function(fromStorage) {
    test_filter = fromStorage.filter
    console.log("filter: " + test_filter)
})

// inject game html and style
fetch(chrome.runtime.getURL('/game/content.css')).then(r => r.text()).then(css => {
    css = '<style>' + css + '</style>'
    document.head.insertAdjacentHTML('beforeend', css);
})
fetch(chrome.runtime.getURL('/game/high_low_game.html')).then(r => r.text()).then(html => {
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById("filter").innerHTML += test_filter
    document.getElementById("mode").innerHTML += 'SAT'

    let icon = document.getElementById("icon")
    icon.src = chrome.extension.getURL("icon.png")
    icon.addEventListener('click', giveUp)
})
console.log("injecting game")

// delay to make sure everything loads
window.addEventListener("load", function() {
    console.log("hi, entering page load delay.....")
    let start = Date.now()
    checkElement('.scores-container').then((tests_div) => {
        console.log(tests_div);
        console.log("delay done")
        console.log("waited " + (Date.now() - start) + " ms for page load")
        action(tests_div)
    });
})

let total_score
function action(tests_div) {

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
        total_score = scores[0].innerHTML
        let reading_score = scores[1].innerHTML
        let math_score = scores[2].innerHTML
        console.log("Scores: " + total_score + " " + reading_score + " " + math_score)

        // alert("Scores: " + total_score + " " + reading_score + " " + math_score)

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

// called when guessing buttons are pressed
function processClick(guess) {
    console.log("Guess: " + guess)

    if (guess.indexOf("&lt;") !== -1 && total_score < 1450) {
        guess = total_score;
    } else if (guess.indexOf("&lt;") !== -1) {
        guess = 1440
    }

    if (guess > total_score) {
        setStatus("Too high!")
    } else if (guess < total_score) {
        setStatus("Too low!")
    } else {
        setStatus("You guessed it!")
        sleep(1500).then(() => {
            document.getElementById("game").remove()
            document.getElementById("root").removeAttribute("hidden")
            console.log("game done, unhiding root :-)")
        })
    }
}

// give up
function giveUp() {
    if (confirm("Are you sure you want to give up?")) {
        document.getElementById("game").remove()
        document.getElementById("root").removeAttribute("hidden")
        console.log("user gave up, unhiding root :-(")
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