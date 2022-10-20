import Container from './components/Container'
import Canvas from './components/Canvas'
import Title from './components/Title'

const App = () => {
  return (
    <Container>
      <Title text={'Test task "Lines"'} />
      <Canvas width={800} height={800} />
    </Container>
  )
}

export default App
