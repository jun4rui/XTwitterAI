// 选项页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    const enableTranslation = document.getElementById('enableTranslation');
    const targetLanguage = document.getElementById('targetLanguage');
    const sourceLanguages = document.getElementById('sourceLanguages');
    const showLanguageTag = document.getElementById('showLanguageTag');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');
    
    // 加载保存的选项
    chrome.storage.sync.get({
        isEnabled: true,
        targetLanguage: 'zh',
        sourceLanguages: ['en', 'ja', 'ko'],
        showLanguageTag: true
    }, function(items) {
        enableTranslation.checked = items.isEnabled;
        targetLanguage.value = items.targetLanguage;
        
        // 设置多选框的选中项
        Array.from(sourceLanguages.options).forEach(option => {
            if (items.sourceLanguages.includes(option.value)) {
                option.selected = true;
            }
        });
        
        showLanguageTag.checked = items.showLanguageTag;
    });
    
    // 保存选项
    saveBtn.addEventListener('click', function() {
        // 获取多选框的所有选中值
        const selectedSourceLanguages = Array.from(sourceLanguages.selectedOptions)
            .map(option => option.value);
        
        const options = {
            isEnabled: enableTranslation.checked,
            targetLanguage: targetLanguage.value,
            sourceLanguages: selectedSourceLanguages,
            showLanguageTag: showLanguageTag.checked
        };
        
        chrome.storage.sync.set(options, function() {
            // 显示保存成功的状态信息
            status.textContent = '设置已保存!';
            status.className = 'status success';
            
            // 2秒后隐藏状态信息
            setTimeout(function() {
                status.style.display = 'none';
            }, 2000);
            
            // 向所有标签页发送消息以更新设置
            chrome.tabs.query({}, function(tabs) {
                tabs.forEach(function(tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "updateOptions",
                        options: options
                    });
                });
            });
        });
    });
});