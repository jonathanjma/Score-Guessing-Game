// setup ap multiselect
let apTests = "[\"2-D Art and Design\", \"3-D Art and Design\", \"Art History\", \"Biology\", \"Calculus AB\", \"Calculus BC\", " +
    "\"Chemistry\", \"Chinese Language and Culture\", \"Comparative Government and Politics\", \"Computer Science A\", " +
    "\"Computer Science Principles\", \"Drawing\", \"English Language and Composition\", \"English Literature and Composition\", " +
    "\"Environmental Science\", \"European History\", \"French Language and Culture\", \"German Language and Culture\", " +
    "\"Human Geography\", \"Italian Language and Culture\", \"Japanese Language and Culture\", \"Latin\", \"Macroeconomics\", " +
    "\"Microeconomics\", \"Music Theory\", \"Physics 1\", \"Physics 2\", \"Physics C: Electricity and Magnetism\", " +
    "\"Physics C: Mechanics\", \"Psychology\", \"Research\", \"Seminar\", \"Spanish Language and Culture\", " +
    "\"Spanish Literature and Culture\", \"Statistics\", \"United States Government and Politics\", \"United States History\", " +
    "\"World History: Modern\"]"
document.getElementById('multiSelect').setAttribute('data-multiSelect', apTests)

document.getElementById('save').addEventListener('click', saveSettings)

// get saved options
chrome.storage.local.get(['satEnabled', 'apEnabled', 'sat', 'satOverPsat', 'ap'], function(fromStorage) {
    console.log('stored values:')
    console.log(fromStorage)
    document.getElementById('satLb').checked = fromStorage.satEnabled
    document.getElementById('apLb').checked = fromStorage.apEnabled

    document.getElementById('sat').value = fromStorage.sat
    if (fromStorage.satOverPsat) {
        document.getElementById('satR').checked = true
    } else {
        document.getElementById('psatR').checked = true
    }
    document.getElementById('multiSelect').setAttribute('data-default', fromStorage.ap)
    pureScriptSelect('#multiSelect')
})

function saveSettings() {
    let satEnabled = document.getElementById('satLb').checked
    let apEnabled = document.getElementById('apLb').checked
    let sat = document.getElementById('sat').value
    let satOverPsat = document.getElementById('satR').checked
    let ap = document.getElementById('ap').value

    let save_dict = {'satEnabled': satEnabled, 'apEnabled': apEnabled, 'sat': sat, 'satOverPsat': satOverPsat, 'ap': ap}
    console.log('saved values:')
    console.log(save_dict)

    chrome.storage.local.set(save_dict);
    alert('Options Saved')
}
