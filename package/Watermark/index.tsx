// 水印
import React,{ useEffect, useRef, useState } from 'react'

import WaterMarkCanvas from './WaterMarkCanvas'
interface WatermarkProps {
  text?: string | string[]
  fontSize?: number
  divide?: number
}
const Watermark = (props: WatermarkProps) => {
  const { text, fontSize = 16, divide = 200 } = props
  const [textList, setTextList] = useState<any>()
  useEffect(() => {
    const newTextList = typeof text === 'string' ? [text] : text || []
    if (JSON.stringify(newTextList || []) !== JSON.stringify(textList || [])) {
      setTextList(newTextList)
    }
  }, [text])
  const watermarkRef: any = useRef()
  useEffect(() => {
    if (!watermarkRef?.current) {
      watermarkRef.current = new WaterMarkCanvas({
        text: textList || [],
        fontSize: fontSize || 16,
        divide: divide || 200,
      })
    } else {
      watermarkRef?.current.reload({
        text: textList || [],
      })
    }
  }, [textList])
  useEffect(() => {
    return () => {
      watermarkRef?.current?.remove()
    }
  }, [])
  return (<span/>)
}

export default Watermark
