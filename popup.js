function init() {

  const url = new URL(document.location.toString());

  const params = [
    'userName',
    'authMethod',
    'tabId',
  ];

  const variables = {
    userName: null,
    authMethod: null,
    tabId: null,
  };

  for(const key of params) {
    const elems = document.getElementsByClassName(key);
    variables[key] = url.searchParams.get(key);
    if (elems.length) {
      elems[0].textContent = variables[key];
    }

  }

  variables.tabId = parseInt(variables.tabId);

  document.getElementsByClassName('logout')[0].addEventListener('click', async () => {

    try {
      await browser.runtime.sendMessage(
        {
          action: 'logout',
          tabId: variables.tabId,
        }
      );
      browser.tabs.reload(variables.tabId, {
        bypassCache: true
      });
      browser.pageAction.close();

    } catch (e) {
      console.log(e);
    }

  });

}

init();
