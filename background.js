// 简单粗暴，每次后台都无脑尝试下载一次所有的语言包

// background.js
// 将 await 代码包装在异步函数中
(async function() {
    const sourceLanguage = ['en', 'ja', 'ko', 'es'];
    const targetLanguage = 'zh';
    const code2lang = {
        'zh':'中文',
        'en': '英语',
        'ja': '日语',
        'ko': '韩语',
        'es': '西班牙语'
    };

    for (const srcLang of sourceLanguage) {
        try {
            // 检查语言模型是否可用
            const translatorCapabilities = await Translator.availability({
                sourceLanguage: srcLang,
                targetLanguage: targetLanguage,
            });

            // 只有当模型不可用时才创建（下载）模型
            if (translatorCapabilities !== 'available') {
                console.log(`模型 ${srcLang} -> ${targetLanguage} 不可用，准备下载...`);

                /*chrome.notifications.create({
                    type: 'basic',
                    title: '下载中',
                    message: `AI模型 ${codecode2lang2str[srcLang]} 翻译 ${code2lang[targetLanguage]} 不可用，自动下载...`,
                    iconUrl: 'icon48.png'
                });*/
                console.log(`AI模型 ${code2lang[srcLang]} 翻译 ${code2lang[targetLanguage]} 不可用，自动下载...`);
                await Translator.create({
                    sourceLanguage: srcLang,
                    targetLanguage: targetLanguage,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            console.log(`Downloading ${srcLang} to ${targetLanguage}, progress: ${e.loaded * 100}%`);
                        });
                    },
                });
            } else {
                console.log(`模型 ${srcLang} -> ${targetLanguage} 已可用，跳过下载`);
            }
        } catch (error) {
            console.error(`检查或下载语言模型失败 ${srcLang}:`, error);
        }
    }
})();