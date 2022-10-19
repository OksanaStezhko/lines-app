import styles from './Container.module.css'

interface IProps {
  children: JSX.Element[] | JSX.Element
}

const Container = ({ children }: IProps) => {
  return <div className={styles.container}>{children}</div>
}

export default Container
