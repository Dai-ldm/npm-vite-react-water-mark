import { v4 as uuidv4 } from 'uuid'
interface DrawProps {
  fontSize?: number
  text?: string | string[]
  divide?: number
  width?: number
  height?: number
  className?: string //水印的样式
  contain?: HTMLElement //存放水印的容器，默认为body
  timeout?: number //窗口大小改变为100调整一次，默认100，d单位ms
  darkText?: string | string[] //暗水印文本，无则为text
  isDark?: boolean //是否有暗水印，默认true
}
class WaterMarkCanvas {
  markImg: string | undefined
  markEleId: string
  options: DrawProps
  mutationObserver: any
  canvas: HTMLCanvasElement | undefined
  style?: string
  timeout: number
  timeoutNum: any
  isDark: boolean
  width: any
  height: any
  constructor(option: DrawProps) {
    this.markEleId = uuidv4()
    this.options = option
    this.init(option)
    this.isDark = option?.isDark === false ? false : true
    this.timeout = option?.timeout || 100
  }
  //画暗水印图片
  getMarkImg(drawProps: DrawProps) {
    const fontSize = 12
    const newDarkText = drawProps?.darkText || drawProps?.text || []
    const textList = typeof newDarkText === 'string' ? [newDarkText] : newDarkText || []
    const fontCfg = fontSize + 'px 微软雅黑'
    const c = document.createElement('canvas')
    const ctx: any = c.getContext('2d')
    ctx.font = fontCfg
    const textWidthList = textList?.map((str) => {
      const textWidth = ctx.measureText(str).width
      return textWidth || 0
    })
    const maxTextWidth = Math.max(...textWidthList)
    c.height = (fontSize + 10) * textList?.length
    c.width = maxTextWidth + fontSize
    c.setAttribute('style', 'height:' + c.height + 'px;width:' + c.width + 'px')
    if (ctx) {
      ctx.clearRect(0, 0, c.width, c.height)
      if (!textList?.length) {
        return
      }
      ctx.font = fontCfg
      textList?.forEach((str, strIndex) => {
        ctx.save()
        const startX = (maxTextWidth - ctx.measureText(str).width) / 2 + fontSize
        ctx.font = fontCfg
        ctx.fillStyle = 'rgb(9 172 28 / 0.5%)'
        ctx.fillText(str, startX, (fontSize + 9) * (strIndex + 1))
        ctx.restore()
      })
    }
    return c.toDataURL('image/png')
  }
  //暗水印用背景图方式渲染
  getStyleStr() {
    const heightStr = this.height || this.height === 0 ? `height:${this.height}px` : 'height:100%'
    const widthStr = this.width || this.width === 0 ? `width:${this.width}px` : 'width:100%'
    const bgStr =
      this.isDark && this.markImg ? `background:url(${this.markImg}) !important;background-repeat: repeat ` : ''
    const strList = [
      'position: fixed',
      'pointer-events: none',
      'right: 0',
      'top:0',
      'left:0',
      'bottom:0',
      `overflow: hidden`,
      `z-index: ${new Date().getFullYear() || 2020}`,
      'user-select: none',
      heightStr,
      widthStr,
      bgStr,
    ].filter((str) => {
      return str && str?.trim()
    })
    return strList.join(' !important;')
  }
  // 判断是否存在水印画布
  drawImg(drawProps: DrawProps) {
    const { text = '', width, height, contain = document.body, className } = drawProps || {}
    const textList = typeof text === 'string' ? [text] : text || []
    let canvas: any = document.getElementById(this.markEleId)
    if (!canvas) {
      canvas = document.createElement('canvas')
    }
    const c: any = canvas
    c.height = contain?.offsetHeight || width
    c.width = contain?.offsetWidth || height
    this.width = c.width
    this.height = c.height
    this.style = this.getStyleStr()
    className && c.setAttribute('class', className)
    c.setAttribute('id', this.markEleId)
    c.setAttribute('style', this.style)
    this.drawText(c, textList, drawProps)
    return canvas
  }
  //绘制
  drawText(c: HTMLCanvasElement, textList: string[], drawProps: DrawProps) {
    const { fontSize = 12, divide = 12 } = drawProps || {}
    const fontCfg = fontSize + 'px 微软雅黑'
    const ctx: any = c.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, c.width, c.height)
      if (!textList?.length) {
        return
      }
      ctx.font = fontCfg
      const textWidthList: number[] = textList?.map((str: string) => {
        const textWidth = ctx.measureText(str).width
        return textWidth || 0
      })
      const textWidth = Math.max(...textWidthList)
      const maxLine = Math.round(c?.height / divide) + 1
      const maxRow = (textList?.length ? Math.ceil(c?.width / divide / textList?.length) : 0) + 1
      for (let i = 0; i < maxLine; i++) {
        for (let j = 0; j < maxRow; j++) {
          textList?.forEach((str: string, strIndex: number) => {
            ctx.save()
            const startX = (textWidth - ctx.measureText(str).width) / 2
            ctx.font = fontCfg
            ctx.fillStyle = 'rgb(0 0 0 / 4%)'
            ctx.translate(j * (textWidth + fontSize), i * divide + strIndex * fontSize)
            ctx.rotate((-30 * Math.PI) / 180)
            ctx.fillText(str, startX, fontSize * (strIndex + 1))
            ctx.restore()
          })
        }
      }
    }
  }
  //用户手动删除监听
  observe(contain?: HTMLElement) {
    if (this.mutationObserver) {
      return
    }
    contain = contain || document.body
    let mutationObserver: any
    const globalWindow: any = window
    const MutationObserver =
      globalWindow?.MutationObserver || globalWindow?.webkitMutationObserver || globalWindow?.MozMutationObserver
    mutationObserver = new MutationObserver(() => {
      const wmInstance = document.getElementById(this.markEleId)
      if (!wmInstance) {
        console.log('水印被删除了！！！')
        this.init(this.options)
        return
      }
      if (this.style && wmInstance.getAttribute('style') !== this.style) {
        console.log('改水印样式了！！！', wmInstance.getAttribute('style'), this.style)
        wmInstance.setAttribute('style', this.style)
      }
    })

    mutationObserver.observe(contain, {
      childList: true, // 观察目标子节点的变化，是否有添加或者删除
      attributes: true, // 观察属性变动
      subtree: true, // 观察后代节点，默认为 false
    })
    this.mutationObserver = mutationObserver
  }
  // 重新加载
  reload(cfg?: DrawProps) {
    const option = {
      ...this.options,
      ...cfg,
    }
    this.isDark = option?.isDark === false ? false : true
    const canvas = this.drawImg(option)
    this.canvas = canvas
    const darkText = this?.options?.darkText || this?.options?.text || []
    const newDarkText = option?.darkText || option?.text || []
    if (this.isDark && canvas && (JSON.stringify(darkText) !== JSON.stringify(newDarkText) || !this.markImg)) {
      const markImg = this.getMarkImg(option)
      this.markImg = markImg
      this.style = this.getStyleStr()
      canvas.setAttribute('style', this.style)
    }
    this.options = option
  }
  //初始化
  init(option: DrawProps) {
    const contain = option.contain || document.body
    const canvas = this.drawImg(option)
    this.canvas = canvas
    const darkText = this?.options?.darkText || this?.options?.text || []
    const newDarkText = option?.darkText || option?.text || []
    if (this.isDark && canvas && (JSON.stringify(darkText) !== JSON.stringify(newDarkText) || !this.markImg)) {
      const markImg = this.getMarkImg(option)
      this.markImg = markImg
      this.style = this.getStyleStr()
      canvas.setAttribute('style', this.style)
    }
    this.options = option
    if (canvas) {
      contain.appendChild(canvas)
    }
    this.observe() //监听
    this.resize()
  }
  //移除
  remove() {
    const ele = document.getElementById(this.markEleId)
    this.timeoutNum && clearTimeout(this.timeoutNum)
    if (ele) {
      this.mutationObserver?.disconnect()
      ele?.remove()
    }
  }
  //元素容器大小变化，重新绘制明水印
  resize() {
    const resizeChange = () => {
      this.timeoutNum && clearTimeout(this.timeoutNum)
      if (document.getElementById(this.markEleId)) {
        this.timeoutNum = setTimeout(() => {
          if (document.getElementById(this.markEleId)) {
            this.reload(this.options)
          } else {
            this.timeoutNum && clearTimeout(this.timeoutNum)
            window.removeEventListener('resize', resizeChange)
          }
        }, this.timeout || 100)
      } else {
        window.removeEventListener('resize', resizeChange)
      }
    }
    window.addEventListener('resize', resizeChange)
  }
}
export default WaterMarkCanvas
