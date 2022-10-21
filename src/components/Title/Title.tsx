import styles from './Title.module.css'

interface IProps {
  text: string
}

const Title: React.FC<IProps> = ({ text }) => {
  return <h1 className={styles.title}>{text}</h1>
}

export default Title
