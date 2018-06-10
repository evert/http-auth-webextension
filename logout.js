const authMap = {};


const showPageAction = async (tabId) => {

  console.log(authMap);

  if (authMap[tabId] === undefined) {
    return;
  }
  await browser.pageAction.show(tabId);
  await browser.pageAction.setTitle({
    tabId: tabId,
    title: "Logged in as " + authMap[tabId]
  });

};


const handleAuthorization = async function(headerValue, tabId) {

  const parts = headerValue.split(' ');
  if (parts[0].toLowerCase() !== 'basic') return;

  const authString = window.atob(parts[1]);
  const [userName, password] = authString.split(':',2);

  authMap[tabId] = userName;

  await showPageAction(tabId);

}

const headersListener = function(details) {

  for(const header of details.requestHeaders) {

    if (header.name.toLowerCase() === 'authorization') {
      handleAuthorization(header.value, details.tabId);
      return;
    }

  }

};


browser.webRequest.onBeforeSendHeaders.addListener(
  headersListener,
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  },
  ["requestHeaders"]
);


browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {

  await showPageAction(tabId);

});
