const authMap = new Map();

/**
 * Shows the page action for tabId.
 */
const showPageAction = async (tabId) => {

  if (!authMap.has(tabId)) {
    return;
  }

  const userName = authMap.get(tabId);

  await browser.pageAction.show(tabId);
  await browser.pageAction.setTitle({
    tabId: tabId,
    title: "Logged in as " + userName
  });
  browser.pageAction.setPopup({
    tabId: tabId,
    popup: '/popup.html?userName=' + encodeURIComponent(userName) + '&authMethod=Basic&tabId=' + tabId,
  });

};

const pendingLogouts = new Set();

const logOut = function(tabId) {

  console.log('logging out ', tabId);
  pendingLogouts.add(tabId);
  authMap.delete(tabId);

}

const handleAuthorization = async function(headerValue, tabId) {

  const parts = headerValue.split(' ');
  if (parts[0].toLowerCase() !== 'basic') return;

  const authString = window.atob(parts[1]);
  const [userName, password] = authString.split(':',2);

  authMap.set(tabId, userName);

  await showPageAction(tabId);

}

/**
 * This function gets called for every HTTP request to see if there's an
 * Authorization header.
 */
const headersListener = function(details) {

  let clearAuth = false;
  if (pendingLogouts.has(details.tabId)) {

    console.log('processing logout for ', details.tabId);

    pendingLogouts.delete(details.tabId);

    return {
      requestHeaders: details.requestHeaders.filter( header => header.name.toLowerCase() !== 'authorization')
    };

  }

  for(const header of details.requestHeaders) {

    if (header.name.toLowerCase() === 'authorization') {
      handleAuthorization(header.value, details.tabId);
      return;
    }

  }

};

/**
 * Register the headers listener.
 */
browser.webRequest.onBeforeSendHeaders.addListener(
  headersListener,
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  },
  ["requestHeaders", "blocking"]
);

/**
 * Whenever the user navigates to a new url, we need to make sure that the
 * page action should be activated/deactived.
 */
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {

  await showPageAction(tabId);

});

browser.runtime.onMessage.addListener( (message, sender, sendResponse) => {

  switch(message.action) {

    case 'logout' :
      logOut(message.tabId);
      break;

  }

});
