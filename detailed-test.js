const puppeteer = require('puppeteer');

async function detailedTest() {
  console.log('🚀 开始详细测试Monaco编辑器...');
  
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
    
    // 监听错误
    page.on('pageerror', error => {
      console.log(`❌ 页面错误: ${error.message}`);
    });
    
    console.log('📱 访问应用...');
    await page.goto('http://localhost:12000', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // 等待React应用加载
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('✅ React应用已加载');
    
    // 等待更长时间让Monaco编辑器加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查页面内容
    const content = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasContent: !!root && root.children.length > 0,
        textContent: document.body.textContent,
        innerHTML: root ? root.innerHTML.substring(0, 500) : 'No root element'
      };
    });
    
    console.log(`📄 页面有内容: ${content.hasContent}`);
    console.log(`📝 文本内容长度: ${content.textContent.length}`);
    console.log(`🔍 HTML片段: ${content.innerHTML.substring(0, 200)}...`);
    
    // 检查Monaco编辑器相关元素
    const monacoCheck = await page.evaluate(() => {
      return {
        hasMonacoGlobal: typeof window.monaco !== 'undefined',
        hasMonacoEditor: !!document.querySelector('.monaco-editor'),
        hasMonacoContainer: !!document.querySelector('[class*="monaco"]'),
        allMonacoElements: document.querySelectorAll('[class*="monaco"]').length
      };
    });
    
    console.log(`🎯 Monaco全局对象: ${monacoCheck.hasMonacoGlobal}`);
    console.log(`📝 Monaco编辑器元素: ${monacoCheck.hasMonacoEditor}`);
    console.log(`📦 Monaco容器元素: ${monacoCheck.hasMonacoContainer}`);
    console.log(`🔢 Monaco相关元素数量: ${monacoCheck.allMonacoElements}`);
    
    // 检查笔记相关元素
    const notesCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent);
      const inputs = Array.from(document.querySelectorAll('input')).map(input => input.placeholder);
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
      
      return {
        buttons,
        inputs,
        headings,
        hasNewNoteButton: buttons.some(text => text.includes('新建') || text.includes('New')),
        hasTitleInput: inputs.some(placeholder => placeholder.includes('标题') || placeholder.includes('title'))
      };
    });
    
    console.log(`🔘 按钮: ${notesCheck.buttons.join(', ')}`);
    console.log(`📝 输入框: ${notesCheck.inputs.join(', ')}`);
    console.log(`📋 标题: ${notesCheck.headings.join(', ')}`);
    console.log(`➕ 有新建按钮: ${notesCheck.hasNewNoteButton}`);
    console.log(`📄 有标题输入: ${notesCheck.hasTitleInput}`);
    
    // 尝试与界面交互
    if (notesCheck.hasTitleInput) {
      console.log('🖱️ 尝试与标题输入框交互...');
      const titleInput = await page.$('input[placeholder*="标题"], input[placeholder*="title"]');
      if (titleInput) {
        await titleInput.click();
        await titleInput.type('测试笔记');
        console.log('✅ 标题输入成功');
      }
    }
    
    // 检查是否有笔记列表
    const notesList = await page.evaluate(() => {
      const listItems = document.querySelectorAll('div[class*="cursor-pointer"], li, [role="listitem"]');
      return Array.from(listItems).map(item => ({
        text: item.textContent.substring(0, 50),
        classes: item.className
      }));
    });
    
    console.log(`📋 找到 ${notesList.length} 个可能的笔记项目`);
    notesList.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text}... (${item.classes})`);
    });
    
    console.log('🎉 详细测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 运行测试
detailedTest().catch(console.error);