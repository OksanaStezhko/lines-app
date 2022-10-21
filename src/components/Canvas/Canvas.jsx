import React, { Component } from 'react'

import styles from './Canvas.module.css'
import Button from '../Button'
import { arrayCouples } from '../../tools'


class Canvas extends Component {
  state = {
    drawing: false,
    lines: [],
    cross: [],
    currentStart: [],
    currentEnd: [],
    currentCrosses: []
  }

  canvasRef = React.createRef()
  ctxRef = React.createRef()

  isButtonLeft = (e) => {
    if (e.button === 0) return true
    e.preventDefault()
    return false;
  }

  handleClick = (e) => {
    if (!this.isButtonLeft(e)) return;
    if (!this.state.drawing) {
      this.startDraw(e)
    } else {
      this.fixDraw(e)
    }
    this.setState((prev) => ({ drawing: !prev.drawing }))
  }

  startDraw = (e) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    this.setState({ currentStart: [offsetX, offsetY] })
  }

  fixDraw = (e) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    const { currentStart, currentCrosses } = this.state
    const newLine = {
      startX: currentStart[0],
      startY: currentStart[1],
      endX: offsetX,
      endY: offsetY,
    }
    this.setState((prev) => ({
      lines: [...prev.lines, newLine],
      currentStart: [],
      currentEnd: [],
      currentCrosses: [],
      cross: [...prev.cross, ...currentCrosses]

    }))

  }

  previewDraw = (e) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    const { drawing, currentStart, currentEnd } = this.state
    if (drawing) {
      this.setState({ currentEnd: [offsetX, offsetY] })
    }

    const newCrosses = this.accountCrossesNewLine({ startX: currentStart[0], startY: currentStart[1], endX: currentEnd[0], endY: currentEnd[1] });
    if (newCrosses.length) {
      this.setState({ currentCrosses: [...newCrosses] })
    }
  }

  coefficient = ({ startX, startY, endX, endY }) => {
    const a = endY - startY
    const b = startX - endX
    const c = -startX * endY + startY * endX
    return { a, b, c }
  }

  isOutOfRange = (line, crossX, crossY) => {
    const { startX, startY, endX, endY } = line
    const rangeX = [startX, endX].sort((x, y) => x - y)
    const rangeY = [startY, endY].sort((x, y) => x - y)
    if (crossX >= rangeX[0] && crossX <= rangeX[1] && crossY >= rangeY[0] && crossY <= rangeY[1]) return false;
    return true;
  }

  accountCross = (line1, line2) => {
    const { a: a1, b: b1, c: c1 } = this.coefficient(line1)
    const { a: a2, b: b2, c: c2 } = this.coefficient(line2)
    if (a1 * b2 - a2 * b1 === 0) return null
    const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
    const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
    if (this.isOutOfRange(line1, crossX, crossY)) return null
    if (this.isOutOfRange(line2, crossX, crossY)) return null
    return { crossX, crossY }
  }

  accountCrossesNewLine = (newLine) => {
    const { lines } = this.state
    if (!lines) return
    const newCrosses = lines.reduce((acc, line) => {
      const newCross = this.accountCross(newLine, line)
      if (!newCross) return acc
      return [...acc, newCross]
    }, [])
    return newCrosses;
  }

  disappearingLines = (time) => {
    const { lines } = this.state
    const newLines = lines.map((line) => {
      const delta = Math.abs(line.startX - line.endX) / 3 / 2;

      const { startX, endX } = line
      const { a, b, c } = this.coefficient(line)

      const newStartX = startX < endX ? startX + delta : startX - delta
      const newEndX = startX < endX ? endX - delta : endX + delta
      const newStartY = (-c - a * newStartX) / b
      const newEndY = (-c - a * newEndX) / b

      return { startX: newStartX, startY: newStartY, endX: newEndX, endY: newEndY }
    })

    this.setState({ lines: [...newLines] })
    const couplesLine = arrayCouples(lines.length)
    const newCrossesLines = couplesLine.reduce((acc, elem) => {
      const cross = this.accountCross(lines[elem[0]], lines[elem[1]])
      if (cross) return [...acc, cross]
      return acc
    }, [])
     this.setState({cross: newCrossesLines})

  }

  clearInterval = (id) => {
    clearInterval(id)
    this.setState({ lines: [] })
  }

  handleClickButton = () => {
    const idInterval = setInterval(this.disappearingLines, 100, 3000)
    setTimeout(this.clearInterval, 3000, idInterval)
  }

  clearCanvas = () => {
    this.ctxRef.current.clearRect(
      0,
      0,
      this.canvasRef.current.width,
      this.canvasRef.current.height
    )
  }

  componentDidMount = () => {
    const { width, height } = this.props
    const canvas = this.canvasRef.current
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    this.ctxRef.current = ctx
  }

  componentDidUpdate = () => {
    this.clearCanvas()
    const { lines, cross, currentEnd, currentStart, currentCrosses } = this.state
    const { ctxRef } = this

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

    if (cross.length) {
      cross.forEach((line) => {
        const { crossX, crossY } = line;
        ctxRef.current.fillStyle = 'red'
        ctxRef.current.beginPath();
        ctxRef.current.arc(crossX, crossY, 4, 0, 2 * Math.PI, false);
        ctxRef.current.fill();
      })
    }

    if (currentCrosses.length) {
      currentCrosses.forEach((line) => {
        const { crossX, crossY } = line;
        ctxRef.current.fillStyle = 'red'
        ctxRef.current.beginPath();
        ctxRef.current.arc(crossX, crossY, 4, 0, 2 * Math.PI, false);
        ctxRef.current.fill();
      })

    }

  }

  render() {
    return (
      <>
        <canvas
          onMouseDown={this.handleClick}
          onMouseMove={this.previewDraw}
          ref={this.canvasRef}
          className={styles.canvas}
        />
        <Button text={'clear'} onClick={this.handleClickButton} />
      </>
    )
  }

}

export default Canvas
