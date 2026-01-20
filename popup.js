// Popup界面逻辑
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('translationToggle');
    const statusDiv = document.getElementById('status');
    const downloadModelsBtn = document.getElementById('downloadModelsBtn');
    
    // 从存储中获取当前启用状态
    chrome.storage.sync.get(['isEnabled'], function(result) {
        const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
        toggleSwitch.checked = isEnabled;
        updateStatusDisplay(isEnabled);
    });
    
    // 监听开关状态变化
    toggleSwitch.addEventListener('change', function() {
        const enabled = this.checked;
        
        // 更新状态显示
        updateStatusDisplay(enabled);
        
        // 保存到存储
        chrome.storage.sync.set({isEnabled: enabled}, function() {
            console.log('Translation setting saved:', enabled);
        });
        
        // 向当前活动标签页发送消息以更新翻译状态
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "toggleTranslation",
                enabled: enabled
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("Could not establish connection. Tab may have been closed.");
                }
            });
        });
    });
    
    // 语言模型下载按钮点击事件
    downloadModelsBtn.addEventListener('click', function() {
        // 向当前活动标签页发送消息以触发模型下载
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "preloadLanguageModels"
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("Could not establish connection. Tab may have been closed.");
                }
            });
        });
    });
    
    function updateStatusDisplay(enabled) {
        if (enabled) {
            statusDiv.textContent = '翻译功能已启用';
            statusDiv.className = 'status enabled';
        } else {
            statusDiv.textContent = '翻译功能已禁用';
            statusDiv.className = 'status disabled';
        }
    }
});