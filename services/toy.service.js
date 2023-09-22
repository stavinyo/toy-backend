import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save
}

function query(filterBy, sortBy) {
    console.log('sortBy', sortBy)

    // Filtering
    if (!filterBy) return Promise.resolve(toys)
    let filteredToys = toys
    console.log(filterBy)

    filteredToys = filteredToys.filter(toy => toy.name.toLowerCase().includes(filterBy.search.toLowerCase()))
    filteredToys = filteredToys.filter((toy) => (toy.price <= filterBy.priceRange[1] && toy.price >= filterBy.priceRange[0]))
    switch (filterBy.inStock) {
        case 'Available':
            filteredToys = filteredToys.filter((toy) => toy.inStock === true)
            break
        case 'notAvailable':
            filteredToys = filteredToys.filter((toy) => toy.inStock === false)
            break
        default:
            break
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        const lowerCaseLabels = filterBy.labels.map(label => label.toLowerCase())

        filteredToys = filteredToys.filter(toy =>
            toy.labels.some(label => lowerCaseLabels.includes(label.toLowerCase()))
        )
    }
    // Sorting
    switch (sortBy) {
        case 'sortByName':
            filteredToys.sort((item1, item2) => item1.name.localeCompare(item2.name));
            break
        case 'sortByNewest':
            filteredToys.sort((item1, item2) => item2.createdAt - item1.createdAt)
            break
        case 'sortByOldest':
            filteredToys.sort((item1, item2) => item1.createdAt - item2.createdAt)
            break
        case 'sortByHighPrice':
            filteredToys.sort((item1, item2) => item2.price - item1.price);
            break
        case 'sortByLowPrice':
            filteredToys.sort((item1, item2) => item1.price - item2.price);
            break
        default:
            break
    }

    return Promise.resolve(filteredToys)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    loggerService.debug('toy', toy)
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        toyToUpdate.name = toy.name
        toyToUpdate.labels = toy.labels
        toyToUpdate.price = toy.price
        toyToUpdate.inStock = toy.inStock
    } else {
        toy._id = _makeId()
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}
