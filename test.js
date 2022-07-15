async function play(game) {
    await game.setup()
    const minOrdinal = game.getMinOrdinal()
    const maxOrdinal = game.getMaxOrdinal()

    let values = {}
    for (let i = minOrdinal; i <= maxOrdinal; i++) {
        values[i] = await game.fetchCardValue(i)
    }

    let valuesInversion = getArrayInversion(values)
    for (let entry in valuesInversion) {
        let matchedTiles = valuesInversion[entry]
        for (let i = 0; i + 1 < matchedTiles.length; i += 2) {
            await game.clickCard(matchedTiles[i])
            await game.clickCard(matchedTiles[i + 1])
        }
    }

    console.assert(await game.won())
    await game.teardown()
}

class PokemonGame {
    async setup() {
        throw new Error("You have to implement the method setup")
    }
    getMinOrdinal() {
        throw new Error("You have to implement the method getMinOrdinal")
    }
    getMaxOrdinal() {
        throw new Error("You have to implement the method getMaxOrdinal")
    }
    async fetchCardValue(ordinal) {
        throw new Error("You have to implement the await method fetchCardValue")
    }
    async clickCard(ordinal) {
        throw new Error("You have to implement the method clickCard")
    }
    async won() {
        throw new Error("You have to implement the method won")
    }
    async teardown() {
        throw new Error("You have to implement the method won")
    }
}

class MockPokemon extends PokemonGame {
    async setup() {
        // throw new Error("You have to implement the method setup")
        console.log(`setup...`)
        await sleep(3)
    }
    getMinOrdinal() {
        // throw new Error("You have to implement the method getMinOrdinal")
        return 0
    }
    getMaxOrdinal() {
        // throw new Error("You have to implement the method getMaxOrdinal")
        return 3
    }
    async fetchCardValue(ordinal) {
        // throw new Error("You have to implement the await method fetchCardValue")
        console.log(`fetchCardValue(${ordinal})`)
        return 1
    }
    async clickCard(ordinal) {
        // throw new Error("You have to implement the method clickCard")
        console.log(`clickCard(${ordinal})`)
    }
    async won() {
        console.log(`won() always return true`)
        // throw new Error("You have to implement the method won")
        return true
    }
    async teardown() {
        console.log(`teardown()`)
        // throw new Error("You have to implement the method won")
    }
}

class Setting {
    constructor(buttonText, buttonIndex, minOrdinal, maxOrdinal) {
        this.buttonText = buttonText
        this.buttonIndex = buttonIndex
        this.minOrdinal = minOrdinal
        this.maxOrdinal = maxOrdinal
    }
}

class LongPokemon extends PokemonGame {
    static _EasySetting = new Setting("4x4", 1, 1, 4 * 4)
    static _NormalSetting = new Setting("6x6", 2, 1, 6 * 6)
    static _HardSetting = new Setting("8X8", 3, 1, 8 * 8)
    static _SuperHardSetting = new Setting("10X10", 4, 1, 10 * 10)
    static _getRandomSetting() {
        let id = getRandomInRange(4) + 1
        switch (id) {
            case 1:
                return LongPokemon._EasySetting
            case 2:
                return LongPokemon._NormalSetting
            case 3:
                return LongPokemon._HardSetting
            case 4:
                return LongPokemon._SuperHardSetting
        }
    }

    constructor() {
        super()
        // let setting = LongPokemon._NormalSetting
        let setting = LongPokemon._getRandomSetting()
        this.buttonText = setting.buttonText
        this.buttonIndex = setting.buttonIndex
        this.minOrdinal = setting.minOrdinal
        this.maxOrdinal = setting.maxOrdinal

        this.milisBetweenClicks = 3000 / Math.max(this.maxOrdinal, 1)
        this.milisBetweenScreens = 1500
        this.milisImplicitlyWait = 1000
    }

    getMinOrdinal() {
        return this.minOrdinal
    }
    getMaxOrdinal() {
        return this.maxOrdinal
    }

    async fetchCardValue(ordinal) {
        let cardDOM = await this._getCard(ordinal)
        let selector = (x) => x.style.backgroundImage.toString()
        try {
            return selector(cardDOM)
        } catch (e) {
            throw Exception(`No attribute with such attribute selector.`)
        }
    }

    async clickCard(ordinal) {
        let cardDOM = await this._getCard(ordinal)
        cardDOM.click()
        await sleep(this.milisBetweenClicks)
    }

    async _getCard(ordinal) {
        const ordinalError = ordinal < this.minOrdinal || ordinal > this.maxOrdinal
        console.assert(!ordinalError, "Invalid ordinal. Should never happen")
        const selector = `#app > div > div > div > div:nth-child(${ordinal}) > div > div.card__face.card__inner__back > div`
        let results = document.querySelectorAll(selector)
        if (results == []) {
            await sleep(this.milisImplicitlyWait)
            results = document.querySelectorAll(selector)
        }
        console.assert(results != [], "No card found with such query selector")
        return results[0]
    }

    async setup() {
        let button = await this._getModeButton()
        button.click()
        await sleep(this.milisBetweenScreens)
    }

    async _getModeButton() {
        let selector = `#app > div.screen > div > button:nth-child(${this.buttonIndex})`
        let results = document.querySelectorAll(selector)
        if (results == []) {
            await sleep(this.milisImplicitlyWait)
            results = document.querySelectorAll(selector)
        }
        console.assert(results != [], "No button found with such query selector")
        return results[0]
    }

    async won() {
        try {
            await this._getReplayButton()
            return true
        } catch (e) {
            return false
        }
    }

    async teardown() {
        let btn = await this._getReplayButton()
        btn.click()
        await sleep(this.milisBetweenScreens)
    }

    async _getReplayButton() {
        await sleep(this.milisBetweenScreens)
        let selector = `#app > div > div > button`
        let results = document.querySelectorAll(selector)
        if (results == []) {
            await sleep(this.milisImplicitlyWait)
            results = document.querySelectorAll(selector)
        }
        console.assert(results.length == 1, "Replay button not found with such query selector")
        return results[0]
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

function getRandomInRange(range) {
    return Math.floor(Math.random() * range)
}

;(async function test() {
    // play(new MockPokemon())
    let i = 0
    while (i++ < 10) {
        await play(new LongPokemon())
    }
})()
