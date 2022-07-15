const config = {
    MIN_ORDINAL: NaN,
    MAX_ORDINAL: NaN,
}

const MODE = {
    NORMAL: 1,
    EASY: 2,
    HARD: 3,
    SUPER_HARD: 4,
}

const sleepBetweenClick = 100

async function test() {
    setupMode(MODE.SUPER_HARD)
    await sleep(1000) // wait for next screen
    let values = await clickAndFetchNodeValues()
    // let values = fetchNodeValues()
    await sleep(1000) // wait for next screen

    let valuesInversion = getArrayInversion(values)
    for (let entry in valuesInversion) {
        let matchedTiles = valuesInversion[entry]
        // console.log({ [entry]: matchedTiles });
        for (let i = 0; i < matchedTiles.length; i++) {
            clickNode(matchedTiles[i])
            await sleep(sleepBetweenClick)
        }
    }
}

function setupMode(mode) {
    switch (mode) {
        case MODE.EASY:
            return setup("4x4", 1, 4 * 4)
        case MODE.NORMAL:
            return setup("6x6", 1, 6 * 6)
        case MODE.HARD:
            return setup("8x8", 1, 8 * 8)
        case MODE.SUPER_HARD:
            return setup("10X10", 1, 10 * 10)
        default:
            throw Exception("Invalid gameMode")
    }
}

function setup(modeText, minOrdinal, maxOrdinal) {
    _selectMode(modeText)
    config.MIN_ORDINAL = minOrdinal
    config.MAX_ORDINAL = maxOrdinal
}

function _selectMode(modeText) {
    try {
        const nodes = document.evaluate(
            `//span[contains(., '${modeText}')]`,
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        )
        let thisNode = nodes.iterateNext()
        thisNode.click()
    } catch (e) {
        console.error(e)
        throw Exception("Invalid mode " + modeText)
    }
}

async function clickAndFetchNodeValues() {
    let values = {}
    for (let i = config.MIN_ORDINAL; i <= config.MAX_ORDINAL; i++) {
        clickNode(i)
        await sleep(sleepBetweenClick / 10)
        values[i] = getNodeValue(i)
    }
    return values
}

function fetchNodeValues() {
    let values = {}
    for (let i = config.MIN_ORDINAL; i <= config.MAX_ORDINAL; i++) {
        values[i] = getNodeValue(i)
    }
    return values
}

function getNodeValue(ordinal) {
    let node = _getTileNode(ordinal)
    try {
        return node.style.backgroundImage.toString()
    } catch (e) {
        console.error(e)
        throw Exception(`Board::getNodeValue. No such DOM attribute error.`)
    }
}

function clickNode(ordinal) {
    _getTileNode(ordinal).click()
}

function _getTileNode(ordinal) {
    if (ordinal < config.MIN_ORDINAL || ordinal > config.MAX_ORDINAL) {
        let msg = `Invalid ordinal ${ordinal}.`
        alert(msg)
        throw Exception(msg)
    }
    const selector = `#app > div > div > div > div:nth-child(${ordinal}) > div > div.card__face.card__inner__back > div`
    let ress = document.querySelectorAll(selector)
    if (ress == []) {
        let msg = `Card ordinal ${ordinal} not found.`
        alert(msg)
        throw Exception(msg)
    } else {
        return ress[0]
    }
}

// class Utils {
function getArrayInversion(dict) {
    let res = {}
    for (let key in dict) {
        const value = dict[key]
        if (value in res) {
            res[value].push(key)
        } else {
            res[value] = [key]
        }
    }
    return res
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
