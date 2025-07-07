let copiedCookies = [];
let copiedStorage = {};

// 显示提示消息
function showMessage(text, isError = false) {
  const message = document.getElementById('message');
  message.textContent = text;
  message.className = isError ? 'message error' : 'message success';
  
  setTimeout(() => {
    message.className = 'message';
  }, 3000);
}

// 显示 Cookie 列表
function displayCookies(cookies) {
  const cookieList = document.getElementById('cookieList');
  cookieList.innerHTML = '';
  
  cookies.forEach(cookie => {
    const item = document.createElement('div');
    item.className = 'cookie-item';
    item.textContent = `${cookie.name} = ${cookie.value}`;
    cookieList.appendChild(item);
  });
}

// 检查是否是本地开发环境
function isLocalDevelopment(hostname) {
  // 常见的本地开发域名模式
  const localPatterns = [
    'localhost',
    '127.0.0.1',
    /.*\.local$/,           // *.local
    /.*\.dev$/,             // *.dev
    /.*\.test$/,            // *.test
    /.*\.dev\..*$/,         // *.dev.*
    /.*\.local\..*$/,       // *.local.*
    /.*\.test\..*$/,        // *.test.*
    /^192\.168\..*$/,       // 192.168.*
    /^10\..*$/,             // 10.*
    /^172\.(1[6-9]|2[0-9]|3[01])\..*$/, // 172.16-31.*
  ];
  
  return localPatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return hostname === pattern;
    } else {
      return pattern.test(hostname);
    }
  });
}

// 刷新当前页面
async function refreshCurrentPage() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  await chrome.tabs.reload(currentTab.id);
}

// 复制 Cookie
document.getElementById('copyCookies').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    
    // 获取当前网页的所有 Cookie
    const cookies = await chrome.cookies.getAll({ url: currentTab.url });
    
    copiedCookies = cookies;
    displayCookies(cookies);
    showMessage(`成功复制 ${cookies.length} 个 Cookie！`);
    
    // 保存到 storage
    chrome.storage.local.set({ copiedCookies: cookies });
  } catch (error) {
    showMessage('复制失败：' + error.message, true);
  }
});

// 粘贴 Cookie
document.getElementById('pasteCookies').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    
    // 从 storage 获取之前保存的 Cookie
    const data = await chrome.storage.local.get('copiedCookies');
    const cookies = data.copiedCookies || [];
    
    if (cookies.length === 0) {
      showMessage('没有找到已复制的 Cookie', true);
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const cookie of cookies) {
      try {
        // 检查是否是本地开发环境
        const isLocalEnv = isLocalDevelopment(url.hostname);
        
        // 准备 Cookie 数据
        const cookieData = {
          url: currentTab.url,
          name: cookie.name,
          value: cookie.value,
          path: cookie.path || '/',
          secure: cookie.secure && url.protocol === 'https:',
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite || 'lax'
        };
        
        // 如果是本地环境，强制设置域名为当前域名
        if (isLocalEnv) {
          cookieData.domain = url.hostname;
        } else {
          // 尝试设置原域名，如果失败则设置为当前域名
          cookieData.domain = cookie.domain;
        }
        
        await chrome.cookies.set(cookieData);
        successCount++;
      } catch (error) {
        console.warn(`设置 Cookie ${cookie.name} 失败:`, error);
        
        // 如果原域名失败，尝试设置为当前域名
        try {
          const fallbackCookieData = {
            url: currentTab.url,
            name: cookie.name,
            value: cookie.value,
            path: cookie.path || '/',
            secure: cookie.secure && url.protocol === 'https:',
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite || 'lax',
            domain: url.hostname
          };
          
          await chrome.cookies.set(fallbackCookieData);
          successCount++;
        } catch (fallbackError) {
          console.error(`Cookie ${cookie.name} 设置完全失败:`, fallbackError);
          failCount++;
        }
      }
    }
    
    if (successCount > 0) {
      showMessage(`成功粘贴 ${successCount} 个 Cookie！${failCount > 0 ? ` (${failCount} 个失败)` : ''}`);
      
      // 延迟 500ms 后刷新页面，确保 Cookie 已经设置完成
      setTimeout(async () => {
        await refreshCurrentPage();
      }, 500);
    } else {
      showMessage('所有 Cookie 粘贴都失败了', true);
    }
    
  } catch (error) {
    showMessage('粘贴失败：' + error.message, true);
  }
});

// 强制粘贴 Cookie（忽略域名限制）
document.getElementById('forcePasteCookies').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    
    // 从 storage 获取之前保存的 Cookie
    const data = await chrome.storage.local.get('copiedCookies');
    const cookies = data.copiedCookies || [];
    
    if (cookies.length === 0) {
      showMessage('没有找到已复制的 Cookie', true);
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const cookie of cookies) {
      try {
        // 强制设置到当前域名
        const cookieData = {
          url: currentTab.url,
          name: cookie.name,
          value: cookie.value,
          path: cookie.path || '/',
          secure: cookie.secure && url.protocol === 'https:',
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite || 'lax',
          domain: url.hostname
        };
        
        await chrome.cookies.set(cookieData);
        successCount++;
      } catch (error) {
        console.error(`强制设置 Cookie ${cookie.name} 失败:`, error);
        failCount++;
      }
    }
    
    if (successCount > 0) {
      showMessage(`强制粘贴成功 ${successCount} 个 Cookie！${failCount > 0 ? ` (${failCount} 个失败)` : ''}`);
      
      // 延迟 500ms 后刷新页面
      setTimeout(async () => {
        await refreshCurrentPage();
      }, 500);
    } else {
      showMessage('强制粘贴失败', true);
    }
    
  } catch (error) {
    showMessage('强制粘贴失败：' + error.message, true);
  }
});

// 显示 Storage 信息
function displayStorage(storage) {
  const cookieList = document.getElementById('cookieList');
  const storageDiv = document.createElement('div');
  storageDiv.className = 'storage-info';
  
  let content = '<h3>Storage 数据</h3>';
  
  if (storage.localStorage && Object.keys(storage.localStorage).length > 0) {
    content += '<h4>localStorage:</h4>';
    Object.entries(storage.localStorage).forEach(([key, value]) => {
      content += `<div class="storage-item">${key} = ${value}</div>`;
    });
  }
  
  if (storage.sessionStorage && Object.keys(storage.sessionStorage).length > 0) {
    content += '<h4>sessionStorage:</h4>';
    Object.entries(storage.sessionStorage).forEach(([key, value]) => {
      content += `<div class="storage-item">${key} = ${value}</div>`;
    });
  }
  
  storageDiv.innerHTML = content;
  cookieList.appendChild(storageDiv);
}

// 复制 Storage
document.getElementById('copyStorage').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // 注入脚本获取 localStorage 和 sessionStorage
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: () => {
        const storage = {
          localStorage: {},
          sessionStorage: {}
        };
        
        // 获取 localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          storage.localStorage[key] = localStorage.getItem(key);
        }
        
        // 获取 sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          storage.sessionStorage[key] = sessionStorage.getItem(key);
        }
        
        return storage;
      }
    });
    
    const storage = results[0].result;
    copiedStorage = storage;
    
    const localStorageCount = Object.keys(storage.localStorage).length;
    const sessionStorageCount = Object.keys(storage.sessionStorage).length;
    
    // 清空现有显示，显示Storage信息
    document.getElementById('cookieList').innerHTML = '';
    displayStorage(storage);
    
    showMessage(`成功复制 ${localStorageCount} 个 localStorage 项和 ${sessionStorageCount} 个 sessionStorage 项！`);
    
    // 保存到 storage
    chrome.storage.local.set({ copiedStorage: storage });
  } catch (error) {
    showMessage('复制 Storage 失败：' + error.message, true);
  }
});

// 粘贴 Storage
document.getElementById('pasteStorage').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // 从 storage 获取之前保存的 Storage
    const data = await chrome.storage.local.get('copiedStorage');
    const storage = data.copiedStorage || {};
    
    const localStorageCount = Object.keys(storage.localStorage || {}).length;
    const sessionStorageCount = Object.keys(storage.sessionStorage || {}).length;
    
    if (localStorageCount === 0 && sessionStorageCount === 0) {
      showMessage('没有找到已复制的 Storage 数据', true);
      return;
    }
    
    // 注入脚本设置 localStorage 和 sessionStorage
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: (storageData) => {
        let successCount = 0;
        let failCount = 0;
        
        // 设置 localStorage
        if (storageData.localStorage) {
          Object.entries(storageData.localStorage).forEach(([key, value]) => {
            try {
              localStorage.setItem(key, value);
              successCount++;
            } catch (error) {
              console.error(`设置 localStorage ${key} 失败:`, error);
              failCount++;
            }
          });
        }
        
        // 设置 sessionStorage
        if (storageData.sessionStorage) {
          Object.entries(storageData.sessionStorage).forEach(([key, value]) => {
            try {
              sessionStorage.setItem(key, value);
              successCount++;
            } catch (error) {
              console.error(`设置 sessionStorage ${key} 失败:`, error);
              failCount++;
            }
          });
        }
        
        return { successCount, failCount };
      },
      args: [storage]
    });
    
    const result = results[0].result;
    
    if (result.successCount > 0) {
      showMessage(`成功粘贴 ${result.successCount} 个 Storage 项！${result.failCount > 0 ? ` (${result.failCount} 个失败)` : ''}`);
      
      // 延迟 500ms 后刷新页面
      setTimeout(async () => {
        await refreshCurrentPage();
      }, 500);
    } else {
      showMessage('所有 Storage 项粘贴都失败了', true);
    }
    
  } catch (error) {
    showMessage('粘贴 Storage 失败：' + error.message, true);
  }
});

// 初始化时显示之前复制的 Cookie
chrome.storage.local.get('copiedCookies', (data) => {
  if (data.copiedCookies) {
    displayCookies(data.copiedCookies);
  }
});

// 初始化时显示之前复制的 Storage
chrome.storage.local.get('copiedStorage', (data) => {
  if (data.copiedStorage) {
    displayStorage(data.copiedStorage);
  }
}); 