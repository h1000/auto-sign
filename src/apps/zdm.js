let {findAndClickIt, clickControl, backward, getNumberFromSelector, MAX, sibling} = require('../util');
let {createApp} = require('../app');

let app = createApp('张大妈', 'com.smzdm.client.android', 'com.smzdm.client.android.app.HomeActivity');
app.add('点击我的', (next) => {
  findAndClickIt(idEndsWith('tab_usercenter'));
  next();
}).add('点击签到', (next) => {
  let el = idEndsWith('tv_login_sign').findOne(MAX);
  if (el) {
    clickControl(el);
    backward();
    sleep(1000);
    if (!idEndsWith('tv_login_sign').exists()) {
      backward();
      sleep(1000);
    }
  }
  next();
}).add('我的任务', (next) => {
  /**
   * 记录任务重试次数
   * @type {{[index: string]: number}}
   */
  let count = {};

  findAndClickIt(text('我的任务'));
  sleep(500);
  let daily = text('日常任务').findOne(MAX);
  while (!daily) {
    let success = scrollDown();
    if (!success) break;
    daily = text('日常任务').findOnce();
  }
  if (!daily) throw new Error('B');
  let p = daily.parent();
  if (!p) throw new Error('C');
  let listContainer = sibling(p, 1);
  if (!listContainer) throw new Error('D');
  let expand = listContainer.findOne(text('展开'));
  if (expand) {
    let expandParent = expand.parent();
    if (expandParent) {
      clickControl(expandParent);
    }
  }
  let task = getNextTask();
  while (task) {
    let titleEl = task.findOne(idEndsWith('tv_title'));
    if (!titleEl) throw new Error('D');
    let btn = task.findOne(idEndsWith('tv_get'));
    if (!btn) throw new Error('E');
    let title = titleEl.text();
    let already = btn.text() === '领奖励';
    clickControl(btn);
    findAndClickIt(idMatches(/.*(btn_go|bt_go).*/));
    if (already) {
      task = getNextTask();
      continue;
    }
    if (/分享/.test(title)) {
      sleep(3000);
      findAndClickIt(text('分享'));
      findAndClickIt(idEndsWith('tv_wechat'));
      let yes = className('android.widget.Button').text('是').findOnce();
      if (yes) {
        clickControl(yes);
        sleep(1000);
      } else {
        sleep(2000);
        backward();
      }
      backward();
      sleep(2000);
    } else {
      sleep(3000);
      backward();
      sleep(2000);
    }
    task = getNextTask();
  }
  backward();
  next();

  function getNextTask() {
    let daily = text('日常任务').findOne(MAX);
    if (!daily) throw new Error('F');
    let p = daily.parent();
    if (!p) throw new Error('G');
    let listContainer = sibling(p, 1);
    if (!listContainer) throw new Error('H');
    let list = listContainer.findOne(idEndsWith('recyclerview'));
    if (!list) throw new Error('I');
    let tasks = list.children();
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      let titleEl = task.findOne(className('android.widget.TextView').idEndsWith('tv_title'));
      let btnEl = task.findOne(idEndsWith('tv_get'));
      if (titleEl == null || btnEl == null) continue;
      let title = titleEl.text();
      let btnText = btnEl.text();
      if (btnText !== '已完成' && !/幸运屋|关注推荐/.test(title) && ((count[title] || 0) < 4)) {
        count[title] = (count[title] || 0) + 1;
        return task;
      }
    }
  }
}).add('我的礼包', (next) => {
  findAndClickIt(text('我的礼包'));
  let listItem = getNextBag();
  while (listItem) {
    let no = listItem.findOne(text('未达成'));
    if (no == null) {
      clickControl(listItem);
      findAndClickIt(className('android.view.View').text('确定'));
      sleep(1000);
      listItem = getNextBag();
    } else {
      break;
    }
  }
  backward();
  next();

  function getNextBag() {
    let t = text('待领取礼包').findOne(MAX);
    if (t == null) return null;
    let p = t.parent();
    if (p == null) return null;
    return sibling(p, 2);
  }
}).add('拔旗子', (next) => {
  findAndClickIt(idEndsWith('tv_login_sign'));
  for (let i = 1; i <= 3; i++) {
    let el = idEndsWith('v_duty_' + i).findOnce();
    if (el) clickControl(el);
    sleep(1000);
    let go = idEndsWith('btn_go').findOnce();
    if (go) clickControl(go);
  }
  next();
}).add('补签', (next) => {
  let b = text('补签').findOne(MAX);
  if (b) {
    clickControl(b);
    sleep(500);
    let t = text('确定').findOnce();
    if (t) {
      clickControl(t);
    } else {
      backward();
    }
  }
  next();
}).add('完成', (next) => {
  console.info('张大妈签到完成');
  next();
});

module.exports = app;