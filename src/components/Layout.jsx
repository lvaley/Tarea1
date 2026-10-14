import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiteNavbar from './SiteNavbar.jsx'
import Footer from './Footer.jsx'
import BackToTop from './BackToTop.jsx'

function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <SiteNavbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

export default Layout
