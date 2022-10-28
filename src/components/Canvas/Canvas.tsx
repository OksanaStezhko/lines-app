import React, { Component } from 'react'

import styles from './Canvas.module.css'
import Button from '../Button'
import { arrayCouples } from '../../tools'

type TLine = { startX: number, startY: number, endX: number, endY: number }

type TLocation = [number, number]
type TArrayNumber = [number, number][]

type TCross = { crossX: number, crossY: number }
type TCrossArray = TCross[] | []

interface IState {
  drawing: boolean,
  lines: TLine[] | [],
  cross: TCrossArray,
  currentStart: TLocation | [],
  currentEnd: TLocation | [],
  currentCrosses: TCrossArray,

}

interface IProps {
  width: number,
  height: number
}

class Canvas extends Component<IProps, IState> {
  state: IState = {
    drawing: false,
    lines: [],
    cross: [],
    currentStart: [],
    currentEnd: [],
    currentCrosses: [],


  }

  canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef()
  ctxRef: CanvasRenderingContext2D | null = null


  isButtonLeft = (e: React.MouseEvent) => {
    if (e.button === 0) return true
    e.preventDefault()
    return false;
  }

  handleClick = (e: React.MouseEvent) => {
    if (!this.isButtonLeft(e)) return;
    if (!this.state.drawing) {
      this.startDraw(e)
    } else {
      this.fixDraw(e)
    }
    this.setState((prev: IState) => ({ drawing: !prev.drawing }))
  }

  startDraw = (e: React.MouseEvent) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    this.setState({ currentStart: [offsetX, offsetY] })
  }

  fixDraw = (e: React.MouseEvent) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    const { currentStart, currentCrosses } = this.state
    if (!currentStart.length) return;
    const newLine: TLine = {
      startX: currentStart[0],
      startY: currentStart[1],
      endX: offsetX,
      endY: offsetY,
    }
    this.setState((prev) => ({
      lines: [...prev.lines, newLine]
    }))

    this.setState((prev) => ({
      cross: [...prev.cross, ...currentCrosses]
    }))

    this.setState({
      currentStart: []
    })

    this.setState({
      currentEnd: []
    })

    this.setState((prev) => ({
      currentCrosses: [],
    }))
  }

  previewDraw = (e: React.MouseEvent) => {
    if (!this.isButtonLeft(e)) return;
    const { nativeEvent } = e;
    const { offsetX, offsetY } = nativeEvent
    const { drawing, currentStart, currentEnd } = this.state
    if (drawing) {
      this.setState({ currentEnd: [offsetX, offsetY] })
    }

    if (currentStart.length && currentEnd.length) {
      const newLine: TLine = { startX: currentStart[0], startY: currentStart[1], endX: currentEnd[0], endY: currentEnd[1] }
      const newCrosses = this.accountCrossesNewLine(newLine);
      if (newCrosses && newCrosses.length) {
        this.setState({ currentCrosses: [...newCrosses] })
      }
    }

  }

  coefficient = (line: TLine) => {
    const { startX, startY, endX, endY } = line
    const a = endY - startY
    const b = startX - endX
    const c = -startX * endY + startY * endX
    return { a, b, c }
  }

  isOutOfRange = (line: TLine, crossX: number, crossY: number) => {
    const { startX, startY, endX, endY } = line
    const rangeX = [startX, endX].sort((x, y) => x - y)
    const rangeY = [startY, endY].sort((x, y) => x - y)
    if (crossX >= rangeX[0] && crossX <= rangeX[1] && crossY >= rangeY[0] && crossY <= rangeY[1]) return false;
    return true;
  }

  accountCross = (line1: TLine, line2: TLine) => {
    const { a: a1, b: b1, c: c1 } = this.coefficient(line1)
    const { a: a2, b: b2, c: c2 } = this.coefficient(line2)
    if (a1 * b2 - a2 * b1 === 0) return null
    const crossX = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
    const crossY = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
    if (this.isOutOfRange(line1, crossX, crossY)) return null
    if (this.isOutOfRange(line2, crossX, crossY)) return null
    return { crossX, crossY }
  }

  accountCrossesNewLine = (newLine: TLine) => {
    const { lines } = this.state

    if (lines.length < 1) return
    let newCrosses: TCrossArray = []
    lines.forEach((line) => {
      const newCross = this.accountCross(newLine, line)
      if (newCross) { newCrosses = [...newCrosses, newCross] }
    })

    return newCrosses;
  }

  disappearingLines = () => {
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
    const couplesLine: TArrayNumber | [] = arrayCouples(lines.length)
    const newCrossesLines = couplesLine.reduce((acc, elem) => {
      const cross = this.accountCross(lines[elem[0]], lines[elem[1]])
      if (cross) return [...acc, cross]
      return acc
    }, [] as TCrossArray)
    this.setState({ cross: newCrossesLines })

  }

  clearInterval = (id: number) => {
    clearInterval(id)
    this.setState({ lines: [] })
  }

  handleClickButton = () => {
    const idInterval = setInterval(this.disappearingLines, 100)
    setTimeout(this.clearInterval, 3000, idInterval)
  }

  clearCanvas = () => {
    const { width, height } = this.props
    if (this.ctxRef) {
      this.ctxRef.clearRect(
        0,
        0,
        width,
        height
      )
    }
  }

  componentDidMount = () => {
    const { width, height } = this.props as IProps
    const canvas = this.canvasRef.current as HTMLCanvasElement
    canvas.width = width
    canvas.height = height
    this.ctxRef = canvas.getContext('2d')
  }

  componentDidUpdate = () => {
    this.clearCanvas()
    const { lines, cross, currentEnd, currentStart, currentCrosses } = this.state
    const { ctxRef } = this

    if (lines.length && ctxRef) {
      lines.forEach((line) => {
        ctxRef.beginPath()
        ctxRef.moveTo(line.startX, line.startY)
        ctxRef.lineTo(line.endX, line.endY)
        ctxRef.stroke()
      })
    }

    if (currentEnd.length && currentStart.length && ctxRef) {
      ctxRef.beginPath()
      ctxRef.moveTo(currentStart[0], currentStart[1])
      ctxRef.lineTo(currentEnd[0], currentEnd[1])
      ctxRef.stroke()
    }

    if (cross.length && ctxRef) {
      cross.forEach(({ crossX, crossY }) => {
        ctxRef.fillStyle = 'red'
        ctxRef.beginPath();
        ctxRef.arc(crossX, crossY, 4, 0, 2 * Math.PI, false);
        ctxRef.fill();
      })
    }

    if (currentCrosses.length && ctxRef) {
      currentCrosses.forEach(({ crossX, crossY }) => {
        ctxRef.fillStyle = 'red'
        ctxRef.beginPath();
        ctxRef.arc(crossX, crossY, 4, 0, 2 * Math.PI, false);
        ctxRef.fill();
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
