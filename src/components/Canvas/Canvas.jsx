import { useRef, useEffect, useState } from 'react'
import styles from './Canvas.module.css'
import Button from '../Button'

const Canvas = ({ width, height }) => {
  const [drawing, setDrawing] = useState(false)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const startDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(offsetX, offsetY)
    setDrawing(true)
  }
  const stopDraw = () => {
    ctxRef.current.closePath()
    setDrawing(false)
  }
  const draw = ({ nativeEvent }) => {
    if (!drawing) return
    const { offsetX, offsetY } = nativeEvent
    ctxRef.current.lineTo(offsetX, offsetY)
    ctxRef.current.stroke()
  }
  const clear = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    )
  }

  useEffect(() => {
    const canvas = canvasRef.current
    // For supporting computers with higher screen densities, we double the screen density

    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    // Setting the context to enable us draw
    const ctx = canvas.getContext('2d')
    // ctx.scale(2, 2)
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctxRef.current = ctx
  }, [])

  return (
    <>
      <canvas
        onMouseDown={startDraw}
        onMouseUp={stopDraw}
        onMouseMove={draw}
        ref={canvasRef}
        className={styles.canvas}
      />
      <Button text={'clear'} onClick={clear} />
    </>
  )
}

export default Canvas
