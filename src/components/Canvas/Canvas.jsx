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


  const handleClick = (e) => {
    if (!drawing) {
      startDraw(e)
    } else {
      fixDraw(e)
    }
    setDrawing((prev) => !prev)
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


    if (cross.length) {

      cross.forEach((line) => {
        const { crossX, crossY } = line;
        ctxRef.current.fillStyle = 'red'
        ctxRef.current.beginPath();
        ctxRef.current.arc(crossX, crossY, 2, 0, 2 * Math.PI, false);
        ctxRef.current.fill();
      })
    }

    if (currentEnd.length) {
      ctxRef.current.beginPath()
      ctxRef.current.moveTo(currentStart[0], currentStart[1])
      ctxRef.current.lineTo(currentEnd[0], currentEnd[1])
      ctxRef.current.stroke()

    }

    const coefficient = ({ startX, startY, endX, endY }) => {
      const a = endY - startY
      const b = startX - endX
      const c = -startX * endY + startY * endX
      return { a, b, c }
    }

    const isOutOfRange = (line, crossX, crossY) => {
      const { startX, startY, endX, endY } = line
      const rangeX = [startX, endX].sort((x, y) => x - y)
      const rangeY = [startY, endY].sort((x, y) => x - y)
      if (crossX >= rangeX[0] && crossX <= rangeX[1] && crossY >= rangeY[0] && crossY <= rangeY[1]) return false;
      return true;
    }

    const accountCross = (line1, line2) => {
      const { a: a1, b: b1, c: c1 } = coefficient(line1)
      const { a: a2, b: b2, c: c2 } = coefficient(line2)
      if (a1 * b2 - a2 * b1 === 0) return null
      const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
      const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
      if (isOutOfRange(line1, crossX, crossY)) return null
      if (isOutOfRange(line2, crossX, crossY)) return null
      return { crossX, crossY }
    }

    const accountCrossesNewLine = (newLine) => {
      console.log('newLine', newLine)
      const newCrosses = lines.reduce((acc, line) => {
        const newCross = accountCross(newLine, line)
        if (!newCross) return acc
        return [...acc, newCross]
      }, [])
      return newCrosses;
    }

    const newCrosses = accountCrossesNewLine({startX: currentStart[0], startY: currentStart[1], endX: currentEnd[0], endY: currentEnd[1]});

    if (newCrosses.length){
      newCrosses.forEach((line)=>{
        const { crossX, crossY } = line;
        ctxRef.current.fillStyle = 'red'
        ctxRef.current.beginPath();
        ctxRef.current.arc(crossX, crossY, 2, 0, 2 * Math.PI, false);
        ctxRef.current.fill();
      })

    }



  }, [lines, cross, currentStart, currentEnd, drawing])

  useEffect(() => {
    if (lines.length >= 2) {
      const coefficient = ({ startX, startY, endX, endY }) => {
        const a = endY - startY
        const b = startX - endX
        const c = -startX * endY + startY * endX
        return { a, b, c }
      }

      const isOutOfRange = (line, crossX, crossY) => {
        const { startX, startY, endX, endY } = line
        const rangeX = [startX, endX].sort((x, y) => x - y)
        const rangeY = [startY, endY].sort((x, y) => x - y)
        if (crossX >= rangeX[0] && crossX <= rangeX[1] && crossY >= rangeY[0] && crossY <= rangeY[1]) return false;
        return true;
      }

      const accountCross = (line1, line2) => {
        const { a: a1, b: b1, c: c1 } = coefficient(line1)
        const { a: a2, b: b2, c: c2 } = coefficient(line2)
        if (a1 * b2 - a2 * b1 === 0) return null
        const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
        const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
        if (isOutOfRange(line1, crossX, crossY)) return null
        if (isOutOfRange(line2, crossX, crossY)) return null
        return { crossX, crossY }
      }

      const crossesNewLine = (newLine) => {
        const newCrosses = lines.reduce((acc, line) => {

          const newCross = accountCross(newLine, line)
          if (!newCross) return acc
          return [...acc, newCross]
        }, [])
        return newCrosses;
      }

      if (lines.length > 1) {
        const newCrosses = crossesNewLine(lines[lines.length-1])
        setCross((prev) => [...prev, ...newCrosses])
      }
    }
  }, [lines, width, height])

  useEffect(() => {

    if (cross.length) {

      cross.forEach((line) => {
        const { crossX, crossY } = line;
        ctxRef.current.fillStyle = 'red'
        ctxRef.current.beginPath();
        ctxRef.current.arc(crossX, crossY, 2, 0, 2 * Math.PI, false);
        ctxRef.current.fill();
      })
    }
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
