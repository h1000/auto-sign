import {findAndClickIt, clickControl, log, backward, getNumberFromSelector, MAX} from '../util';
import {createApp} from '../app';

let app = createApp('京东金融', 'com.jd.jrapp', 'com.jd.jrapp.bm.mainbox.main.MainActivity');
app.add('点击首页', (next) => {
  let el = className('android.widget.ImageView').idEndsWith('iv_first_icon').findOne(MAX);
  if (el == null) el = className('android.widget.RelativeLayout').idEndsWith('firstLayout').findOne(MAX);
  if (el) clickControl(el);
  next();
}).add('点击每日签到', (next) => {
  let el = className('android.widget.TextView').textEndsWith('签到').findOne(20000)
  if (el) {
    clickControl(el)
  } else {
    throw new Error('每日签到按钮未找到')
  }
  next();
}).add('点击签到按钮', (next) => {
  findAndClickIt(textMatches(/^(.*已连续签到?\d+天.*|.*签到领钢镚.*)$/));
  next();
});

export default app;
