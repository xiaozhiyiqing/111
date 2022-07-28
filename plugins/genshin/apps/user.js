import plugin from '../../../lib/plugins/plugin.js'
import fs from 'node:fs'
import gsCfg from '../model/gsCfg.js'
import User from '../model/user.js'

export class user extends plugin {
  constructor (e) {
    super({
      name: '用户绑定',
      dsc: '米游社ck绑定，游戏uid绑定',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: '^(体力|ck|cookie)帮助',
          fnc: 'ckHelp'
        },
        {
          reg: '^(ck|cookie)代码',
          fnc: 'ckCode'
        },
        {
          reg: '^#绑定(cookie|ck)',
          fnc: 'bingCk'
        },
        {
          reg: '(.*)_MHYUUID(.*)',
          event: 'message.private',
          fnc: 'noLogin'
        },
        {
          reg: '#?我的(ck|cookie)$',
          event: 'message',
          fnc: 'myCk'
        },
        {
          reg: '#?删除(ck|cookie)',
          fnc: 'delCk'
        },
        // {
        //   reg: '#?重置(ck|cookie)',
        //   permission: 'master',
        //   fnc: 'resetCk'
        // }
        {
          reg: '^#绑定(uid|UID)?[1|2|5][0-9]{8}',
          fnc: 'bingUid'
        },
        {
          reg: '^#(我的)?(uid|UID)[0-9]{0,2}$',
          fnc: 'showUid'
        }
      ]
    })

    this.User = new User(e)
  }

  async init () {
    let file = './data/MysCookie'
    if (!fs.existsSync(file)) {
      fs.mkdirSync(file)
    }
    /** 加载旧的绑定ck json */
    this.loadOldData()
  }

  /** 接受到消息都会执行一次 */
  accept () {
    if (!this.e.msg) return

    if (this.e.msg.includes('ltoken') && this.e.msg.includes('ltuid')) {
      this.e.ck = this.e.msg
      this.e.msg = '#绑定cookie'
      return true
    }

    if (this.e.msg == '#绑定uid') {
      this.setContext('saveUid')
      this.reply('请发送绑定的uid', false, { at: true })
      return true
    }
  }

  /** 绑定uid */
  saveUid () {
    let uid = this.e.msg.match(/[1|2|5][0-9]{8}/g)
    if (!uid) {
      this.reply('uid输入错误', false, { at: true })
      return
    }
    this.e.msg = '#绑定' + this.e.msg
    this.bingUid()
    this.finish('saveUid')
  }

  /** 未登录ck */
  async noLogin () {
    this.reply('绑定cookie失败\n请先【登录米游社】再获取cookie')
  }

  /** #ck代码 */
  async ckCode () {
    await this.reply('javascript:(()=>{prompt(\'\',document.cookie)})();')
  }

  /** ck帮助 */
  async ckHelp () {
    let set = gsCfg.getConfig('mys', 'set')
    await this.reply(`Cookie绑定配置教程：${set.cookieDoc}\n获取cookie后【私聊发送】进行绑定`)
  }

  // async resetCk () {
  //   await this.User.resetCk()
  //   this.reply('cookie统计次数已重置')
  // }

  /** 绑定ck */
  async bingCk () {
    let set = gsCfg.getConfig('mys', 'set')

    if (!this.e.ck) {
      await this.reply(`请【私聊】发送米游社cookie，获取教程：\n${set.cookieDoc}`)
      return
    }

    await this.User.bing()
  }

  /** 删除ck */
  async delCk () {
    let msg = await this.User.del()
    await this.reply(msg)
  }

  /** 绑定uid */
  async bingUid () {
    await this.User.bingUid()
  }

  /** #uid */
  async showUid () {
    let index = this.e.msg.match(/[0-9]{1,2}/g)

    if (index && index[0]) {
      await this.User.toggleUid(index[0])
    } else {
      await this.User.showUid()
    }
  }

  /** 我的ck */
  async myCk () {
    if (this.e.isGroup) {
      await this.reply('请私聊查看')
      return
    }
    await this.User.myCk()
  }

  /** 加载旧的绑定ck json */
  loadOldData () {
    this.User.loadOldData()
  }
}
