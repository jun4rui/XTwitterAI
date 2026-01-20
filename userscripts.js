// ==UserScript==
// @name         X Tweet Translator
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  油猴脚本版，可能后期不再继续维护。采用Chrome内置的翻译AI进行本地翻译。Translate English tweets to Chinese on X (Twitter) using Chrome's built-in Translator API
// @author       You
// @match        https://*.x.com/*
// @match        https://*.twitter.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 语言模型状态管理
    const languageModels = {
        en: { loaded: false, translator: null },
        ja: { loaded: false, translator: null },
        ko: { loaded: false, translator: null },
        es: { loaded: false, translator: null }
    };
    
    // 创建下载进度条元素
    const progressContainer = document.createElement('div');
    progressContainer.className = 'download-progress-container';
    progressContainer.id = 'downloadProgressContainer';
    progressContainer.innerHTML = `
        <div class="download-status" id="downloadStatus">正在下载语言模型...</div>
        <div class="download-progress-bar">
            <div class="download-progress-fill" id="downloadProgressFill"></div>
        </div>
    `;
    document.body.appendChild(progressContainer);
    
    // 创建翻译文本的样式
    const style = document.createElement('style');
    style.textContent = `
        .translated-text {
            font-size: 0.9em;
            font-style: normal !important;
            color: #657786;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #e1e8ed;
        }
    `;
    document.head.appendChild(style);


    // 使用MutationObserver监听按钮button[data-testid="tweet-text-show-more-link"]
    const showMoreObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 处理"显示更多"按钮点击事件的通用函数
                    function handleShowMoreClick(targetNode) {
                        console.log('Click more button.');
                        // 找到相关的tweet元素并重新翻译
                        const tweetContainer = targetNode.closest('[data-testid="tweet"]');
                        if (tweetContainer) {
                            // 删除已有的翻译文本
                            const existingTranslations = tweetContainer.querySelectorAll('.translated-text');
                            existingTranslations.forEach(trans => trans.remove());

                            // 重置翻译状态，以便重新翻译
                            const articleElement = tweetContainer.closest('article');
                            if (articleElement) {
                                articleElement.removeAttribute('data-translated');
                            }

                            // 重新翻译这条推文
                            setTimeout(() => {
                                translateTweet(tweetContainer);
                            }, 100);
                        }
                    }

                    // 检查新增节点是否是"显示更多"按钮
                    if (node.matches && node.matches('button[data-testid="tweet-text-show-more-link"]')) {
                        node.addEventListener('click', () => {
                            handleShowMoreClick(node);
                        });
                    }

                    // 检查新增节点内部是否有"显示更多"按钮
                    const showMoreButtons = node.querySelectorAll && node.querySelectorAll('button[data-testid="tweet-text-show-more-link"]');
                    if (showMoreButtons) {
                        showMoreButtons.forEach(button => {
                            button.addEventListener('click', () => {
                                handleShowMoreClick(button);
                            });
                        });
                    }
                }
            });
        });
    });

    // 开始观察document body中"显示更多"按钮的变化
    if (document.body) {
        showMoreObserver.observe(document.body, {
            childList: true, subtree: true
        });
    }

    // 显示下载进度
    function showDownloadProgress(show) {
        const container = document.getElementById('downloadProgressContainer');
        if (container) {
            container.style.display = show ? 'block' : 'none';
        }
    }
    
    // 更新下载进度
    function updateDownloadProgress(percent, status) {
        const fill = document.getElementById('downloadProgressFill');
        const statusEl = document.getElementById('downloadStatus');
        
        if (fill) fill.style.width = percent + '%';
        if (statusEl) statusEl.textContent = status;
    }
    
    // 预加载语言模型
    async function preloadLanguageModels() {
        showDownloadProgress(true);
        
        const languages = ['en', 'ja', 'ko', 'es'];
        const total = languages.length;
        let completed = 0;
        
        for (const lang of languages) {
            try {
                updateDownloadProgress((completed / total) * 100, `正在加载 ${lang} -> zh 模型 (${completed + 1}/${total})`);
                
                // 创建翻译器实例
                const translator = await window.Translator.create({
                    sourceLanguage: lang,
                    targetLanguage: 'zh'
                });
                
                // 保存翻译器实例
                languageModels[lang].loaded = true;
                languageModels[lang].translator = translator;
                
                completed++;
                const progress = (completed / total) * 100;
                updateDownloadProgress(progress, `已加载 ${lang} -> zh 模型 (${completed}/${total})`);
                
            } catch (error) {
                console.error(`Failed to load model for ${lang}:`, error);
                completed++;
                const progress = (completed / total) * 100;
                updateDownloadProgress(progress, `跳过 ${lang} -> zh 模型 (${completed}/${total})`);
            }
        }
        
        updateDownloadProgress(100, '所有语言模型已准备就绪 ✓');
        setTimeout(() => {
            showDownloadProgress(false);
        }, 2000);
    }
    
    // 使用Chrome内置翻译API翻译文本
    function translateText(text, callback, sourceLanguage = 'en', targetLanguage = 'zh') {

        // 如果sourceLanguage不是在['en','ja','ko','es']中的任何一个，则退出
        if (!['en', 'ja', 'ko', 'es'].includes(sourceLanguage)) {
            callback(text);
            return;
        }

        // 检查浏览器是否支持Chrome内置翻译API
        if (!('Translator' in self)) {
            console.warn('Chrome Translator API not supported, falling back to original text');
            callback(text);
            return;
        }

        // 异步翻译，使用预加载的翻译器
        (async () => {
            try {
                let translator;
                
                // 如果语言模型已预加载，则使用预加载的翻译器
                if (languageModels[sourceLanguage].loaded && languageModels[sourceLanguage].translator) {
                    translator = languageModels[sourceLanguage].translator;
                } else {
                    // 否则临时创建一个翻译器
                    translator = await window.Translator.create({
                        sourceLanguage: sourceLanguage,
                        targetLanguage: targetLanguage
                    });
                }
                
                // 执行翻译
                const translatedText = await translator.translate(text);
                
                // 如果是临时创建的翻译器，需要销毁
                if (!languageModels[sourceLanguage].loaded || !languageModels[sourceLanguage].translator) {
                    await translator.destroy();
                }

                callback(translatedText || text);
            } catch (error) {
                console.error("Chrome Translator API error:", error);
                callback(text); // 翻译失败时返回原文
            }
        })();
    }
    
    // 页面加载完成后预加载语言模型
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            preloadLanguageModels();
        });
    } else {
        preloadLanguageModels();
    }


    // 翻译推文内容
    function translateTweet(tweetElement) {
        // 查找推文的主要文本内容
        const tweetTextElements = tweetElement.querySelectorAll('[data-testid="tweetText"]');

        tweetTextElements.forEach(textEl => {
            // 获取到文本的语言
            const sourceLanguage = textEl.getAttribute('lang');
            // 检查是否已经翻译过
            if (textEl.closest('article') && textEl.closest('article').getAttribute('data-translated') === 'true') {
                return; // 如果已翻译则跳过
            } else {
                // 标记该article元素已翻译
                textEl.closest('article').setAttribute('data-translated', 'true');
            }
            // 获取原始文本
            const originalText = textEl.innerText || textEl.textContent;

            // 翻译文本
            translateText(originalText, function (translatedText) {
                if (translatedText !== originalText && translatedText.trim() !== '') {
                    // 创建翻译文本容器
                    const translationDiv = document.createElement('div');
                    translationDiv.className = 'translated-text';


                    // 根据源语言设置标签
                    let langLabel = '';

                    switch (sourceLanguage) {
                        case 'en':
                            langLabel = '英译中:';
                            break;
                        case 'ja':
                            langLabel = '日译中:';
                            break;
                        case 'ko':
                            langLabel = '韩译中:';
                            break;
                        case 'es':
                            langLabel = '西译中:';
                            break;
                        default:
                            langLabel = `${sourceLanguage}译中:`; // 默认情况
                    }

                    translationDiv.innerHTML = `<strong>${langLabel}</strong> ${translatedText}`;
                    translationDiv.style.fontStyle = 'italic';

                    // 添加到推文文本下方
                    textEl.appendChild(translationDiv);
                }
            }, sourceLanguage, 'zh');
        });
    }

    // 监听 DOM 变化以捕获动态加载的内容
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 检查新增节点是否是推文
                    if (node.matches && (node.matches('[data-testid="tweet"]') || node.querySelector && node.querySelector('[data-testid="tweet"]'))) {
                        // 等待一小段时间确保内容加载完成后再翻译
                        setTimeout(() => {
                            translateTweet(node);
                        }, 300);
                    }
                }
            });
        });
    });

    // 开始观察整个文档的变化
    if (document.body) {
        observer.observe(document.body, {
            childList: true, subtree: true
        });
    } else {
        // 如果 body 还不存在，则等待它出现
        new MutationObserver((mutations, obs) => {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true, subtree: true
                });

                obs.disconnect();
            }
        }).observe(document, {childList: true, subtree: true});
    }

    // 页面完全加载后执行一次翻译
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // 翻译页面上所有现有的推文
            const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
            tweetElements.forEach(tweetEl => {
                translateTweet(tweetEl);
                const articleElement = tweetEl.closest('article');
                if (articleElement) {
                    articleElement.setAttribute('data-tweet-translated', 'true');
                }
            });
        });
    } else {
        // 翻译页面上所有现有的推文
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        tweetElements.forEach(tweetEl => {
            translateTweet(tweetEl);
            const articleElement = tweetEl.closest('article');
            if (articleElement) {
                articleElement.setAttribute('data-tweet-translated', 'true');
            }
        });
    }

})();