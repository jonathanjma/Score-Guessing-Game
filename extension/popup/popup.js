document.getElementById('save').addEventListener('click', saveFilter)
let apTests = "[\"2-D Art and Design\", \"3-D Art and Design\", \"Drawing\", \"Art History\", \"Music Theory\", \"Comparative Government and Politics\"," +
    "\"European History\", \"Human Geography\", \"Macroeconomics\", \"Microeconomics\", \"Psychology\", \"United States Government and Politics\"," +
    "\"United States History\", \"World History: Modern\", \"Calculus AB\", \"Calculus BC\", \"Computer Science A\", \"Computer Science Principles\"," +
    "\"Statistics\", \"Biology\", \"Chemistry\", \"Environmental Science\", \"Physics 1: Algebra-Based\", \"Physics 2: Algebra-Based\"," +
    "\"Physics C: Electricity and Magnetism\", \"Physics C: Mechanics\", \"Chinese Language and Culture\", \"French Language and Culture\"," +
    "\"German Language and Culture\", \"Italian Language and Culture\", \"Japanese Language and Culture\", \"Latin\", \"Spanish Language and Culture\"," +
    "\"Spanish Literature and Culture\"]"
document.getElementById('multiSelect').setAttribute('data-multiSelect', apTests)

// chrome.storage.local.get(['filter'], function(fromStorage) {
//     document.getElementById('sat').value = fromStorage.filter
// })

document.getElementById('satLb').checked = true
document.getElementById('apLb').checked = true

document.getElementById('satR').checked = true
document.getElementById('sat').value = 'April 27'
let apDefault = "[\"Computer Science A\"]" //"[\"Physics 1: Algebra-Based\", \"Statistics\"]";
document.getElementById('multiSelect').setAttribute('data-default', apDefault)

pureScriptSelect('#multiSelect');

function saveFilter() {
    let sat = document.getElementById("sat").value;
    let satOverPsat = document.getElementById("satR").checked;
    let ap = JSON.parse(document.getElementById("ap").value);
    let satEnabled = document.getElementById('satLb').checked;
    let apEnabled = document.getElementById('apLb').checked;
    console.log(sat)
    console.log(satOverPsat)
    console.log(ap)
    console.log(satEnabled)
    console.log(apEnabled)
    // chrome.storage.local.set({'filter': filterIn});
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
