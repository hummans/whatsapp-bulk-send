import '../../assets/img/icon-34.png'
import '../../assets/img/icon-128.png'
import LinksQueue from './links-queue'

console.log('This is the background page.')

// open the page
chrome.browserAction.onClicked.addListener(() => {
  const bgPageUrl = chrome.extension.getURL('popup.html')
  console.log('Opening ', bgPageUrl)
  chrome.tabs.create({ url: bgPageUrl })
})

const getSavedLinksQueue = () =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get('linksQueue', ({ linksQueue: linksQueueData = null }) => {
      if (chrome.runtime.lastError) {
        const errorMsg = `get linksQueue chrome.runtime.lastError: ${chrome.runtime.lastError.message}`
        console.log(errorMsg)
        reject(errorMsg)
        return
      }

      const linksQueue = LinksQueue.parse(linksQueueData)
      resolve(linksQueue)
    })
  )

const saveLinksQueue = function(queue, sendResponse) {
  chrome.storage.local.set({ linksQueue: queue }, async () => {
    if (chrome.runtime.lastError) {
      const errorMsg = `set linksQueue chrome.runtime.lastError: ${chrome.runtime.lastError.message}`
      console.log(errorMsg)
      return sendResponse({ status: 500, message: errorMsg })
    }

    // check that links data are saved OK
    try {
      const linksQueue = await getSavedLinksQueue()
      // saved OK
      console.log('Saved links queue: ', linksQueue)
      return sendResponse({ status: 200 })
    } catch (error) {
      return sendResponse({ status: 500, message: error })
    }
  })
}
const handleSetLinksMessage = (links, sendResponse) => {
  const queue = new LinksQueue(links)
  saveLinksQueue(queue, sendResponse)
}

const status = {
  queue: null,
}

const handleStartQueueMessage = (data, sendResponse) => {
  getSavedLinksQueue()
    .then(linksQueue => {
      linksQueue.start()
      sendResponse({ status: 200 })
    })
    .catch(error => {
      sendResponse({ status: 500, message: error ? error.message || error : '' })
    })
}

const handleUpdateQueueMessage = (linksQueue, sendResponse) => {
  saveLinksQueue(linksQueue, sendResponse)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, data } = request
  console.log('Background onMessage', request)

  if (type === 'set-links') {
    console.log('message to save links', data)
    handleSetLinksMessage(data, sendResponse)
    return true
  }

  if (type === 'start') {
    console.log('message to start queue')
    handleStartQueueMessage(data, sendResponse)
    return true
  }

  if (type === 'update-queue') {
    console.log('message to update queue status', request.update)
    handleUpdateQueueMessage(data, sendResponse)
    return true
  }

  sendResponse({ status: 404, message: `type ${type} not handled` })
  return true
})
