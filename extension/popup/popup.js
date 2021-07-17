// setup ap multiselect
let apTests = "[\"2-D Art and Design\", \"3-D Art and Design\", \"Drawing\", \"Art History\", \"Music Theory\", \"Comparative Government and Politics\"," +
    "\"European History\", \"Human Geography\", \"Macroeconomics\", \"Microeconomics\", \"Psychology\", \"United States Government and Politics\"," +
    "\"United States History\", \"World History: Modern\", \"Calculus AB\", \"Calculus BC\", \"Computer Science A\", \"Computer Science Principles\"," +
    "\"Statistics\", \"Biology\", \"Chemistry\", \"Environmental Science\", \"Physics 1: Algebra-Based\", \"Physics 2: Algebra-Based\"," +
    "\"Physics C: Electricity and Magnetism\", \"Physics C: Mechanics\", \"Chinese Language and Culture\", \"French Language and Culture\"," +
    "\"German Language and Culture\", \"Italian Language and Culture\", \"Japanese Language and Culture\", \"Latin\", \"Spanish Language and Culture\"," +
    "\"Spanish Literature and Culture\"]"
document.getElementById('multiSelect').setAttribute('data-multiSelect', apTests)

document.getElementById('save').addEventListener('click', saveFilter)

// get saved options
console.log("stored values:")
chrome.storage.local.get(['satEnabled'], function(fromStorage) {
    console.log(fromStorage.satEnabled)
    document.getElementById('satLb').checked = fromStorage.satEnabled
})
chrome.storage.local.get(['apEnabled'], function(fromStorage) {
    console.log(fromStorage.apEnabled)
    document.getElementById('apLb').checked = fromStorage.apEnabled
})

chrome.storage.local.get(['sat'], function(fromStorage) {
    console.log(fromStorage.sat)
    document.getElementById('sat').value = fromStorage.sat
})
chrome.storage.local.get(['satOverPsat'], function(fromStorage) {
    console.log(fromStorage.satOverPsat)
     if (fromStorage.satOverPsat) {
         document.getElementById('satR').checked = true
     } else {
         document.getElementById('psatR').checked = true
     }
})
chrome.storage.local.get(['ap'], function(fromStorage) {
    console.log(fromStorage.ap)
    document.getElementById('multiSelect').setAttribute('data-default', fromStorage.ap)
    pureScriptSelect('#multiSelect')
})

function saveFilter() {
    let satEnabled = document.getElementById('satLb').checked
    let apEnabled = document.getElementById('apLb').checked
    let sat = document.getElementById("sat").value
    let satOverPsat = document.getElementById("satR").checked
    let ap = document.getElementById("ap").value

    console.log("saved values:")
    console.log(satEnabled); console.log(apEnabled); console.log(sat); console.log(satOverPsat); console.log(ap);

    chrome.storage.local.set({'satEnabled': satEnabled});
    chrome.storage.local.set({'apEnabled': apEnabled});
    chrome.storage.local.set({'sat': sat});
    chrome.storage.local.set({'satOverPsat': satOverPsat});
    chrome.storage.local.set({'ap': ap});
    alert('Options Saved')
}

let arrows = document.getElementsByClassName('arrow')
for (let arrow of arrows) {
    arrow.addEventListener("click", () => {
        processClick(arrow)
    })
}

function processClick(arrow) {
    let div = arrow.classList[1] + 'Div'
    if (arrow.innerHTML === "\u25B6") {
        arrow.innerHTML = '&#9660;'
        document.getElementById(div).removeAttribute("hidden")
    } else {
        arrow.innerHTML = '&#9654;'
        document.getElementById(div).setAttribute("hidden", "true")
    }
}
