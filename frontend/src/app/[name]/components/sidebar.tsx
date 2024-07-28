export const SidebarComponent = ({onDataPass}:{onDataPass:(data:string) => void}) => {
  const sendMode = async (mode:string) => {
    onDataPass(mode)
  }
  return (
    <section>
      <p onClick={() => sendMode("home")}>🏠</p>
      <p onClick={() => sendMode("dm")}>💬</p>
      <p onClick={() => sendMode("notice")}>🔔</p>
      <p onClick={() => sendMode("addserver")}>十</p>
    </section>
  )
}