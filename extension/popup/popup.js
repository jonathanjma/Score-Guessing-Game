// setup ap multiselect
let apTests = "[\"2-D Art and Design\", \"3-D Art and Design\", \"Drawing\", \"Art History\", \"Music Theory\", \"Comparative Government and Politics\"," +
    "\"European History\", \"Human Geography\", \"Macroeconomics\", \"Microeconomics\", \"Psychology\", \"United States Government and Politics\"," +
    "\"United States History\", \"World History: Modern\", \"Calculus AB\", \"Calculus BC\", \"Computer Science A\", \"Computer Science Principles\"," +
    "\"Statistics\", \"Biology\", \"Chemistry\", \"Environmental Science\", \"Physics 1: Algebra-Based\", \"Physics 2: Algebra-Based\"," +
    "\"Physics C: Electricity and Magnetism\", \"Physics C: Mechanics\", \"Chinese Language and Culture\", \"French Language and Culture\"," +
    "\"German Language and Culture\", \"Italian Language and Culture\", \"Japanese Language and Culture\", \"Latin\", \"Spanish Language and Culture\"," +
    "\"Spanish Literature and Culture\", \"English Literature and Composition\", \"English Language and Composition\"]"
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
