// hmm page not hidden fast enough
// does not work on referrers (when linked clicked on other page)

// hide page
Array.prototype.slice.call(document.querySelectorAll("body *:not(#game)")).forEach(function(value) {
    value.classList.add("hide");
});
console.log("hiding page")

// get test filter
let test_filter
/*chrome.storage.local.get(['filter'], function(fromStorage) {
    test_filter = fromStorage.filter
    console.log("filter: " + test_filter)
})*/
test_filter = ["Computer Science Principles", "Computer Science A"]

// inject game html and style
fetch(chrome.runtime.getURL('/game/content.css')).then(r => r.text()).then(css => {
    css = '<style>' + css + '</style>'
    document.head.insertAdjacentHTML('beforeend', css);
})
fetch(chrome.runtime.getURL('/game/high_low_game2.html')).then(r => r.text()).then(html => {
    document.body.insertAdjacentHTML('afterbegin', html);

    let filter_text = ""
    for (let test of test_filter) {
        filter_text += test + " ";
    }
    document.getElementById("filter").innerHTML += filter_text
    document.getElementById("mode").innerHTML += 'AP'

    let icon = document.getElementById("icon")
    icon.src = chrome.extension.getURL("icon.png")
    icon.addEventListener('click', giveUp)
})
console.log("injecting game")

// delay to make sure everything loads
// window.addEventListener("load", function() {
    console.log("hi, entering page load delay.....")
    sleep(100).then(() => {
    let start = Date.now()
    checkElement('#scoresListArea').then((years_div) => {
        console.log(years_div);
        console.log("delay done")
        console.log("waited " + (Date.now() - start) + " ms for page load")
        action(years_div)
    })})
// })

let score_dict = []
let index = 0, curTest, curScore
function action(years_div) {

    // try {
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

    /*} catch (e) {
        setStatus("Error, check test filter and reload")
        console.log("error, could not locate scores")
        console.log(e)
    }*/
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
                Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function(value){
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