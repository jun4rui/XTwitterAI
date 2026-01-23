// Popup界面逻辑
document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('translationToggle');
    const statusDiv = document.getElementById('status');


    // 监听开关状态变化
    toggleSwitch.addEventListener('change', function () {
        const enabled = this.checked;

        // 更新状态显示
        updateStatusDisplay(enabled);

        // 保存到存储
        chrome.storage.sync.set({isEnabled: enabled}, function () {
            console.log('Translation setting saved:', enabled);
        });

        // 向当前活动标签页发送消息以更新翻译状态
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "toggleTranslation",
                enabled: enabled
            }, function (response) {
                if (chrome.runtime.lastError) {
                    console.log("Could not establish connection. Tab may have been closed.", response);
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