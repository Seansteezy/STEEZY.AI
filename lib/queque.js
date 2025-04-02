import EventEmitter from 'events'

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

const QUEUE_DELAY = 5 * 1000

export default class Queque extends EventEmitter {
  _queue = new Set()

  constructor() {
    super()
  }

  // Add item to the queue
  add(item) {
    this._queue.add(item)
    // console.debug('add item to queue', item, 'at index', this._queue.size)
  }

  // Check if the item exists in the queue
  has(item) {
    return this._queue.has(item)
  }

  // Remove an item from the queue
  delete(item) {
    this._queue.delete(item)
    // console.debug('delete item from queue', item, 'now have', this._queue.size, 'in queue')
  }

  // Get the first item in the queue
  first() {
    return [...this._queue].shift()
  }

  // Check if the item is the first in the queue
  isFirst(item) {
    return this.first() === item
  }

  // Get the last item in the queue
  last() {
    return [...this._queue].pop()
  }

  // Check if the item is the last in the queue
  isLast(item) {
    return this.last() === item
  }

  // Get the index of the item in the queue
  getIndex(item) {
    return [...this._queue].indexOf(item)
  }

  // Get the size of the queue
  getSize() {
    return this._queue.size
  }

  // Check if the queue is empty
  isEmpty() {
    return this.getSize() === 0
  }

  // Remove an item from the front of the queue (unqueue)
  unqueue(item) {
    let queueItem
    if (item) {
      if (this.has(item)) {
        queueItem = item
        const isFirst = this.isFirst(item)
        if (!isFirst) {
          throw new Error('Item is not first in queue')
        }
      } else {
        // console.error('Item not found in queue', item)
      }
    } else {
      queueItem = this.first()
    }

    if (queueItem) {
      this.delete(queueItem)
      this.emit(queueItem)
    }
  }

  // Wait for an item to be processed in the queue
  waitQueue(item) {
    return new Promise((resolve, reject) => {
      // console.debug('Waiting for queue item', item)
      if (this.has(item)) {
        const solve = async (removeQueue = false) => {
          await delay(QUEUE_DELAY)
          // console.debug('Item', item, 'processed')
          if (removeQueue) this.unqueue(item)
          if (!this.isEmpty()) this.unqueue()
          resolve()
        }

        if (this.isFirst(item)) {
          // console.debug('Item', item, 'is first in queue')
          solve(true)
        } else {
          this.once(item, solve)
        }
      } else {
        reject(new Error('Item not found in queue'))
      }
    })
  }
}