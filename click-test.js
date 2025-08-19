const puppeteer = require('puppeteer');

async function clickTest() {
  console.log('🚀 开始点击测试...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      console.log(`🖥️ 控制台: ${msg.text()}`);
    });
    
    console.log('📱 访问应用...');
    await page.goto('http://localhost:12000', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // 等待React应用加载
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('✅ React应用已加载');
    
    // 等待笔记列表加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 查找并点击第一个笔记
    const firstNote = await page.$('.cursor-pointer');
    if (firstNote) {
      console.log('🖱️ 点击第一个笔记...');
      await firstNote.click();
      
      // 等待编辑器加载
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 检查Monaco编辑器是否加载
      const monacoAfterClick = await page.evaluate(() => {
        return {
          hasMonacoGlobal: typeof window.monaco !== 'undefined',
          hasMonacoEditor: !!document.querySelector('.monaco-editor'),
          hasMonacoContainer: !!document.querySelector('[class*="monaco"]'),
          allMonacoElements: document.querySelectorAll('[class*="monaco"]').length,
          hasEditorContainer: !!document.querySelector('[data-testid="editor-container"], .editor-container')
        };
      });
      
      console.log(`🎯 点击后Monaco全局对象: ${monacoAfterClick.hasMonacoGlobal}`);
      console.log(`📝 点击后Monaco编辑器元素: ${monacoAfterClick.hasMonacoEditor}`);
      console.log(`📦 点击后Monaco容器元素: ${monacoAfterClick.hasMonacoContainer}`);
      console.log(`🔢 点击后Monaco相关元素数量: ${monacoAfterClick.allMonacoElements}`);
      console.log(`📋 编辑器容器: ${monacoAfterClick.hasEditorContainer}`);
      
      // 检查编辑器区域的内容
      const editorContent = await page.evaluate(() => {
        const rightPanel = document.querySelector('.flex-1');
        return {
          hasRightPanel: !!rightPanel,
          rightPanelContent: rightPanel ? rightPanel.textContent.substring(0, 200) : 'No right panel',
          hasTitleInput: !!document.querySelector('input[placeholder*="标题"]'),
          hasTextarea: !!document.querySelector('textarea'),
          hasPreviewButton: !!document.querySelector('button[title*="预览"]')
        };
      });
      
      console.log(`📱 右侧面板: ${editorContent.hasRightPanel}`);
      console.log(`📄 右侧面板内容: ${editorContent.rightPanelContent}...`);
      console.log(`📝 标题输入框: ${editorContent.hasTitleInput}`);
      console.log(`📋 文本区域: ${editorContent.hasTextarea}`);
      console.log(`👁️ 预览按钮: ${editorContent.hasPreviewButton}`);
      
      // 如果有标题输入框，尝试输入
      if (editorContent.hasTitleInput) {
        console.log('📝 测试标题输入...');
        const titleInput = await page.$('input[placeholder*="标题"]');
        if (titleInput) {
          await titleInput.click();
          await titleInput.type('测试标题');
          console.log('✅ 标题输入成功');
        }
      }
      
    } else {
      console.log('❌ 没有找到可点击的笔记');
    }
    
    console.log('🎉 点击测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 运行测试
clickTest().catch(console.error);