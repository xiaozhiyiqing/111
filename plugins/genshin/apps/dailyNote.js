import plugin from '../../../lib/plugins/plugin.js'
import Note from '../model/note.js'
import MysSign from '../model/mysSign.js'
import gsCfg from '../model/gsCfg.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

export class dailyNote extends plugin {
  constructor () {
    super({
      name: '体力查询',
      dsc: '原神体力、札记查询，米游社签到',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: '^#*(体力|树脂|查询体力)$',
          fnc: 'note'
        },
        {
          reg: '^(#签到|#*米游社(自动)*签到)$',
          fnc: 'sign'
        }
      ]
    })

    this.set = gsCfg.getConfig('mys', 'set')

    /** 定时任务 */
    this.task = {
      cron: this.set.signTime,
      name: '米游社签到任务',
      fnc: () => this.signTask()
    }
  }

  /** #体力 */
  async note () {
    let data = await Note.get(this.e)
    if (!data) return

    /** 生成图片 */
    let img = await puppeteer.screenshot('dailyNote', data)
    if (img) await this.reply(img)
  }

  /** #签到 */
  async sign () {
    await MysSign.sign(this.e)
  }

  /** 签到任务 */
  async signTask () {
    let mysSign = new MysSign()
    await mysSign.signTask()
  }
}