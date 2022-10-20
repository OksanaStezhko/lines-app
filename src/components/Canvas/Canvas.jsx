import { useRef, useEffect, useState } from 'react'
import styles from './Canvas.module.css'
import Button from '../Button'

const Canvas = ({ width, height }) => {
  const [drawing, setDrawing] = useState(false)
  const [currentStart, setCurrentStart] = useState([])
  const [currentEnd, setCurrentEnd] = useState([])
  const [lines, setLines] = useState([])
  const [cross, setCross] = useState([])
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  const coefficient = ({ startX, startY, endX, endY }) => {
    const a = endY - startY
    const b = startX - endX
    const c = -startX * endY + startY * endX
    return { a, b, c }
  }
  const accountCross = (line1, line2) => {
    const { a: a1, b: b1, c: c1 } = coefficient(line1)
    const { a: a2, b: b2, c: c2 } = coefficient(line2)

    const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
    const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
    return { crossX, crossY }
  }

  const handleClick = (e) => {
    if (!drawing) {
      startDraw(e)
    } else {
      fixDraw(e)
    }
    setDrawing((prev) => !prev)
  }

  const addNewCross = () => {
    if (lines.length < 1) return
    console.log(lines)
    const newCross = lines.reduce((acc, line, index, array) => {
      const lastIndex = array.length - 1
      if ((index = lastIndex)) return acc
      return [...acc, accountCross(array[lastIndex], line)]
    }, [])
    setCross((prev) => [...prev, ...newCross])
  }

  const fixDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setLines((prev) => [
      ...prev,
      {
        startX: currentStart[0],
        startY: currentStart[1],
        endX: offsetX,
        endY: offsetY,
      },
    ])
    setCurrentStart([])
    setCurrentEnd([])
    // addNewCross()
  }

  const previewDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    if (drawing) {
      setCurrentEnd([offsetX, offsetY])
    }
  }

  const startDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setCurrentStart([offsetX, offsetY])
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
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx
  }, [width, height])

  useEffect(() => {
    clear()
    if (lines.length) {
      lines.forEach((line) => {
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(line.startX, line.startY)
        ctxRef.current.lineTo(line.endX, line.endY)
        ctxRef.current.stroke()
      })
    }
    if (currentEnd.length) {
      ctxRef.current.beginPath()
      ctxRef.current.moveTo(currentStart[0], currentStart[1])
      ctxRef.current.lineTo(currentEnd[0], currentEnd[1])
      ctxRef.current.stroke()
    }
  }, [lines, currentStart, currentEnd, drawing])

  useEffect(() => {
    if (lines.length >= 2) {
      const coefficient = ({ startX, startY, endX, endY }) => {
        const a = endY - startY
        const b = startX - endX
        const c = -startX * endY + startY * endX
        return { a, b, c }
      }
      const accountCross = (line1, line2) => {
        const { a: a1, b: b1, c: c1 } = coefficient(line1)
        const { a: a2, b: b2, c: c2 } = coefficient(line2)
        console.log('line1', line1)
        console.log('line2', line2)
        console.log('line1', a1, b1, c1)
        console.log('line2', a2, b2, c2)
        if (a1 * b2 - a2 * b1 === 0) return null

        const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
        const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
        if ((crossX > width) | (crossY > height) | (crossX < 0) | (crossY < 0))
          return null
        return { crossX, crossY }
      }
      if (lines.length > 1) {
        console.log(lines)
        const newCrosses = lines.reduce((acc, line, index, array) => {
          const lastIndex = array.length - 1
          if (index === lastIndex) return acc
          const newCross = accountCross(array[lastIndex], line)
          if (!newCross) return acc
          console.log('newCross', newCross)
          return [...acc, newCross]
        }, [])
        setCross((prev) => [...prev, ...newCrosses])
      }
    }
  }, [lines, width, height])

  useEffect(() => {
    console.log(cross)
  }, [cross])
  return (
    <>
      <canvas
        onMouseDown={handleClick}
        onMouseMove={previewDraw}
        ref={canvasRef}
        className={styles.canvas}
      />
      <Button text={'clear'} onClick={clear} />
    </>
  )
}

export default Canvas
