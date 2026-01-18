import wavezyncLogoDark from '../../../../../resources/wavezync-dark.png?asset'
import wavezyncLogoLight from '../../../../../resources/wavezync-light.png?asset'
import { useTheme } from '@renderer/contexts/ThemeContext'

export const PoweredBy = () => {
  const { theme } = useTheme()
  const wavezyncLogo = theme.mode === 'light' ? wavezyncLogoLight : wavezyncLogoDark

  return (
    <div className="absolute bottom-5 flex justify-center items-center">
      <div className="text-xs text-secondary-foreground mr-1">Powered by</div>
      <a href="https://wavezync.com" target="_blank" rel="noreferrer">
        <img src={wavezyncLogo} alt="Wavezync" className="h-5" />
      </a>
    </div>
  )
}
