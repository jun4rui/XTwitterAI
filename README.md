# X Tweet Translator Chrome Extension
![LOGO](./resources/128x128.png)

这是一个将X（原Twitter）上的英文推文翻译成中文的Chrome扩展程序，基于原有的Tampermonkey用户脚本改造而成。

## 目前问题

- Translator API下载的模型是一次性的，所以内置下载按钮可靠性存疑
- 其他语言有待进一步推进

## 功能特性

- 使用Chrome内置的 Translator API 通过浏览器中提供的 AI 模型翻译文本，速度超快！
- Translator API 号称使用经过训练的专家模型来生成高质量的译文，实测还凑合。
- 自动检测并翻译X/Twitter页面上的推文
- 支持多种语言翻译（目前包含英语、日语、韩语、西班牙）
- 提供弹出窗口控制翻译功能的开启/关闭

## 文件结构

- `manifest.json`: Chrome扩展的清单文件
- `content.js`: 内容脚本，负责翻译功能的核心逻辑
- `styles.css`: 样式文件
- `popup.html`: 扩展弹出窗口界面
- `popup.js`: 弹出窗口的逻辑处理
- `options.html`: 选项页面界面
- `options.js`: 选项页面的逻辑处理

## 安装方法

1. 在Chrome浏览器中打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择此目录

## 使用方法

1. 安装扩展后，在访问X/Twitter页面时会自动翻译推文
2. 点击扩展图标可以快速开启/关闭翻译功能

## 注意事项

- 此扩展依赖于Chrome内置的翻译API，需要Chrome 138和以上版本，并且硬件需要达标（很低）
- 需要适当的权限来访问X和Twitter网站
- 翻译结果可能因API限制而有所不同

## 图标生成说明

项目包含图标源文件，在resources目录中：
- icon16.png (16x16)
- icon48.png (48x48) 
- icon128.png (128x128)
